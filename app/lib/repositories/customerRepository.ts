import "server-only";

import { db } from "../db/db";

export interface CustomerRow {
  id: number;
  phone: string;
  name: string | null;
  email: string | null;
  password_hash: string;
  is_active: boolean;
}

export class CustomerRepository {
  static async getByPhone(
    phone: string
  ): Promise<CustomerRow | null> {
    const { rows } = await db.query(
      `
      SELECT id, phone, name, email, password_hash, is_active
      FROM customers
      WHERE phone = $1
      `,
      [phone]
    );

    return rows[0] ?? null;
  }

  static async create(data: {
    phone: string;
    name?: string | null;
    email?: string | null;
    passwordHash: string;
  }): Promise<CustomerRow> {
    const { rows } = await db.query(
      `
      INSERT INTO customers (phone, name, email, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, phone, name, email, password_hash, is_active
      `,
      [
        data.phone,
        data.name ?? null,
        data.email ?? null,
        data.passwordHash,
      ]
    );

    return rows[0];
  }

  // Batch lookup for list pages that need to match a set of phone
  // numbers to accounts (e.g. admin/password-resets) without running
  // one query per row.
  static async getByPhones(
    phones: string[]
  ): Promise<CustomerRow[]> {
    if (phones.length === 0) {
      return [];
    }

    const { rows } = await db.query(
      `
      SELECT id, phone, name, email, password_hash, is_active
      FROM customers
      WHERE phone = ANY($1::text[])
      `,
      [phones]
    );

    return rows;
  }

  static async getById(
    id: number
  ): Promise<CustomerRow | null> {
    const { rows } = await db.query(
      `
      SELECT id, phone, name, email, password_hash, is_active
      FROM customers
      WHERE id = $1
      `,
      [id]
    );

    return rows[0] ?? null;
  }

  static async getAll(promoterCode?: string): Promise<
    Omit<CustomerRow, "password_hash">[]
  > {
    const params: string[] = [];
    let whereClause = "";

    if (promoterCode) {
      params.push(promoterCode);
      whereClause = `WHERE p.code = $${params.length}`;
    }

    const { rows } = await db.query(
      `
      SELECT
        c.id, c.phone, c.name, c.email, c.is_active, c.created_at,
        p.name AS referred_by_promoter_name,
        p.code AS referred_by_promoter_code,
        (
          c.active_session_id IS NOT NULL
          AND c.active_session_expires_at > CURRENT_TIMESTAMP
        ) AS has_active_session
      FROM customers c
      LEFT JOIN promoters p ON p.id = c.referred_by_promoter_id
      ${whereClause}
      ORDER BY c.created_at DESC
      `,
      params
    );

    return rows;
  }

  // The durable, account-level promoter binding — see migration 022.
  // This is what order/subscription creation checks first, before
  // falling back to the promoter_ref cookie.
  static async getReferralPromoterId(
    id: number
  ): Promise<number | null> {
    const { rows } = await db.query(
      `SELECT referred_by_promoter_id FROM customers WHERE id = $1`,
      [id]
    );

    return rows[0]?.referred_by_promoter_id ?? null;
  }

  // First-touch only: binds the account to a promoter iff it isn't
  // already attributed to one. This is deliberate — without it, a
  // customer could be re-attributed to a different promoter on every
  // login (whether by mistake or by a promoter trying to poach existing
  // customers), silently moving commission for future purchases off of
  // whoever actually referred them first. Returns whether THIS call is
  // what bound it.
  static async attributeReferral(
    id: number,
    promoterId: number
  ): Promise<boolean> {
    const { rows } = await db.query(
      `
      UPDATE customers
      SET referred_by_promoter_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND referred_by_promoter_id IS NULL
      RETURNING id
      `,
      [id, promoterId]
    );

    return rows.length > 0;
  }

  static async updatePassword(
    id: number,
    passwordHash: string
  ): Promise<void> {
    await db.query(
      `
      UPDATE customers
      SET password_hash = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [id, passwordHash]
    );
  }

  static async updateEmail(
    id: number,
    email: string
  ): Promise<void> {
    await db.query(
      `
      UPDATE customers
      SET email = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [id, email]
    );
  }

  // --- Single-active-session login (see migration 024) ---

  // True iff there's a still-unexpired session already on this
  // account — a login attempt while this is true gets rejected rather
  // than silently displacing the other device.
  static async hasActiveSession(id: number): Promise<boolean> {
    const { rows } = await db.query(
      `
      SELECT 1 FROM customers
      WHERE id = $1
        AND active_session_id IS NOT NULL
        AND active_session_expires_at > CURRENT_TIMESTAMP
      `,
      [id]
    );

    return rows.length > 0;
  }

  static async setActiveSession(
    id: number,
    sessionId: string,
    expiresAt: Date
  ): Promise<void> {
    await db.query(
      `
      UPDATE customers
      SET active_session_id = $2, active_session_expires_at = $3
      WHERE id = $1
      `,
      [id, sessionId, expiresAt]
    );
  }

  // Used by getCustomerSession() on every authenticated request to
  // confirm the presented JWT's sessionId is still THE active one —
  // this is what makes an admin's force-logout (or a natural expiry)
  // take effect immediately rather than only blocking future logins.
  static async getActiveSessionId(
    id: number
  ): Promise<string | null> {
    const { rows } = await db.query(
      `SELECT active_session_id FROM customers WHERE id = $1`,
      [id]
    );

    return rows[0]?.active_session_id ?? null;
  }

  // Self-service logout — only clears the slot if it's still this
  // exact session (guards against a stale/duplicate logout call from a
  // device that's already been superseded some other way clobbering a
  // newer, legitimate session).
  static async clearActiveSession(
    id: number,
    sessionId: string
  ): Promise<void> {
    await db.query(
      `
      UPDATE customers
      SET active_session_id = NULL, active_session_expires_at = NULL
      WHERE id = $1 AND active_session_id = $2
      `,
      [id, sessionId]
    );
  }

  // Admin support lever — unconditionally frees the login slot (e.g.
  // "I lost my phone, I can't log out from it myself").
  static async forceLogout(id: number): Promise<void> {
    await db.query(
      `
      UPDATE customers
      SET active_session_id = NULL, active_session_expires_at = NULL
      WHERE id = $1
      `,
      [id]
    );
  }
}
