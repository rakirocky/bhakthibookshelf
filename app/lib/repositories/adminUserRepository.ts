import "server-only";

import { db } from "../db/db";

export interface AdminUserRow {
  id: number;
  phone: string;
  name: string | null;
  password_hash: string;
  is_active: boolean;
}

export class AdminUserRepository {
  static async getByPhone(
    phone: string
  ): Promise<AdminUserRow | null> {
    const { rows } = await db.query(
      `
      SELECT id, phone, name, password_hash, is_active
      FROM admin_users
      WHERE phone = $1
      `,
      [phone]
    );

    return rows[0] ?? null;
  }
}
