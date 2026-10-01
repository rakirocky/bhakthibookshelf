import "server-only";

import { db } from "../db/db";
import type { ImportedContact } from "../contacts/contactImport";

export type ContactSource = "all" | "site" | "import";
export type ContactConsent = "all" | "yes" | "unknown" | "no";

export type ContactFilters = {
  source?: ContactSource;
  consent?: ContactConsent;
  q?: string;
};

export type ContactRow = {
  phone: string;
  name: string | null;
  language: "en" | "kn" | null;
  is_site_user: boolean;
  in_import: boolean;
  contact_id: number | null;
  consent: "yes" | "unknown" | "no";
  added_at: string;
};

// One row per phone number: imported contacts merged with live website/app
// customers (deleted accounts excluded). An opt-out on either side wins,
// then an opt-in, else "unknown".
const MERGED = `
  WITH site AS (
    SELECT phone, name, marketing_opt_in, created_at
    FROM customers
    WHERE deleted_at IS NULL
  )
  SELECT
    COALESCE(s.phone, m.phone)                 AS phone,
    COALESCE(NULLIF(s.name, ''), m.name)       AS name,
    m.language                                 AS language,
    (s.phone IS NOT NULL)                      AS is_site_user,
    (m.id IS NOT NULL)                         AS in_import,
    m.id                                       AS contact_id,
    CASE
      WHEN s.marketing_opt_in IS FALSE OR m.consent = 'no' THEN 'no'
      WHEN s.marketing_opt_in IS TRUE OR m.consent = 'yes' THEN 'yes'
      ELSE 'unknown'
    END                                        AS consent,
    LEAST(s.created_at, m.created_at)          AS added_at
  FROM site s
  FULL OUTER JOIN marketing_contacts m ON m.phone = s.phone
`;

function where(f: ContactFilters, params: unknown[]) {
  const clauses: string[] = [];
  if (f.source === "site") clauses.push("is_site_user");
  if (f.source === "import") clauses.push("in_import");
  if (f.consent && f.consent !== "all") {
    params.push(f.consent);
    clauses.push(`consent = $${params.length}`);
  }
  const q = f.q?.trim();
  if (q) {
    params.push(`%${q.replace(/[%_\\]/g, "\\$&")}%`);
    const p = `$${params.length}`;
    clauses.push(`(phone LIKE ${p} OR name ILIKE ${p})`);
  }
  return clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
}

export class MarketingContactRepository {
  static async list(f: ContactFilters, page: number, pageSize: number) {
    const params: unknown[] = [];
    const w = where(f, params);
    const { rows } = await db.query(
      `SELECT *, COUNT(*) OVER () AS total
       FROM (${MERGED}) c ${w}
       ORDER BY added_at DESC NULLS LAST, phone
       LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`,
      params
    );
    return {
      rows: rows as (ContactRow & { total: string })[],
      total: rows.length ? Number(rows[0].total) : 0,
    };
  }

  /** Every matching row, for the CSV export. */
  static async all(f: ContactFilters): Promise<ContactRow[]> {
    const params: unknown[] = [];
    const w = where(f, params);
    const { rows } = await db.query(
      `SELECT * FROM (${MERGED}) c ${w} ORDER BY added_at DESC NULLS LAST, phone`,
      params
    );
    return rows;
  }

  static async stats() {
    const { rows } = await db.query(`
      SELECT
        COUNT(*)                                   AS total,
        COUNT(*) FILTER (WHERE is_site_user)       AS site,
        COUNT(*) FILTER (WHERE in_import)          AS imported,
        COUNT(*) FILTER (WHERE consent = 'yes')    AS opted_in,
        COUNT(*) FILTER (WHERE consent = 'no')     AS opted_out
      FROM (${MERGED}) c
    `);
    const r = rows[0];
    return {
      total: Number(r.total),
      site: Number(r.site),
      imported: Number(r.imported),
      optedIn: Number(r.opted_in),
      optedOut: Number(r.opted_out),
    };
  }

  /** For the import preview: which of these numbers we already have. */
  static async alreadyKnown(phones: string[]) {
    if (phones.length === 0) return { contacts: 0, siteUsers: 0 };
    const { rows } = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM marketing_contacts WHERE phone = ANY($1)) AS contacts,
         (SELECT COUNT(*) FROM customers WHERE deleted_at IS NULL AND phone = ANY($1)) AS site_users`,
      [phones]
    );
    return { contacts: Number(rows[0].contacts), siteUsers: Number(rows[0].site_users) };
  }

  /**
   * Adds new numbers; for numbers already imported, only fills in a
   * missing name/language — never touches consent (an opt-out must stick
   * however often the same list is uploaded again).
   */
  static async importContacts(
    filename: string,
    contacts: ImportedContact[],
    stats: { totalRows: number; invalid: number; duplicatesInFile: number }
  ) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const { rows: [imp] } = await client.query(
        `INSERT INTO marketing_contact_imports (filename, total_rows, skipped_invalid, skipped_duplicate)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [filename.slice(0, 255), stats.totalRows, stats.invalid, stats.duplicatesInFile]
      );
      let added = 0;
      let updated = 0;
      const CHUNK = 5000;
      for (let i = 0; i < contacts.length; i += CHUNK) {
        const part = contacts.slice(i, i + CHUNK);
        const { rows } = await client.query(
          `INSERT INTO marketing_contacts (phone, name, language, import_id)
           SELECT p, n, l, $4 FROM unnest($1::varchar[], $2::varchar[], $3::varchar[]) AS t(p, n, l)
           ON CONFLICT (phone) DO UPDATE SET
             name       = COALESCE(marketing_contacts.name, EXCLUDED.name),
             language   = COALESCE(marketing_contacts.language, EXCLUDED.language),
             updated_at = CURRENT_TIMESTAMP
           RETURNING (xmax = 0) AS inserted`,
          [part.map((c) => c.phone), part.map((c) => c.name), part.map((c) => c.language), imp.id]
        );
        for (const r of rows) {
          if (r.inserted) added++;
          else updated++;
        }
      }
      await client.query(
        `UPDATE marketing_contact_imports SET added = $2, updated = $3 WHERE id = $1`,
        [imp.id, added, updated]
      );
      await client.query("COMMIT");
      return { importId: imp.id as number, added, updated };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Record a person's choice on every record holding this number: the
   * imported contact and/or the website/app account.
   */
  static async setConsent(phone: string, consent: "yes" | "no") {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const a = await client.query(
        `UPDATE marketing_contacts SET consent = $2, consent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE phone = $1`,
        [phone, consent]
      );
      const b = await client.query(
        `UPDATE customers SET marketing_opt_in = $2, marketing_opt_in_at = CURRENT_TIMESTAMP
         WHERE phone = $1 AND deleted_at IS NULL`,
        [phone, consent === "yes"]
      );
      await client.query("COMMIT");
      return (a.rowCount ?? 0) + (b.rowCount ?? 0) > 0;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  /** Removes an imported contact (website/app accounts are not touched). */
  static async deleteImported(id: number) {
    const { rowCount } = await db.query(`DELETE FROM marketing_contacts WHERE id = $1`, [id]);
    return (rowCount ?? 0) > 0;
  }

  static async recentImports(limit = 5) {
    const { rows } = await db.query(
      `SELECT * FROM marketing_contact_imports ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return rows;
  }
}
