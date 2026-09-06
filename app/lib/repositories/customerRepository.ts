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

  static async getAll(): Promise<
    Omit<CustomerRow, "password_hash">[]
  > {
    const { rows } = await db.query(`
      SELECT id, phone, name, email, is_active, created_at
      FROM customers
      ORDER BY created_at DESC
    `);

    return rows;
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
}
