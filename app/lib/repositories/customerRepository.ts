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
        p.code AS referred_by_promoter_code
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
}
