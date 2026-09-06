import "server-only";

import { db } from "../db/db";

export class PasswordResetRequestRepository {
  static async create(phone: string) {
    const { rows } = await db.query(
      `
      INSERT INTO password_reset_requests (phone, status)
      VALUES ($1, 'PENDING')
      RETURNING id, phone, status, created_at
      `,
      [phone]
    );

    return rows[0];
  }

  static async getPending() {
    const { rows } = await db.query(`
      SELECT id, phone, status, created_at
      FROM password_reset_requests
      WHERE status = 'PENDING'
      ORDER BY created_at ASC
    `);

    return rows;
  }

  static async markResolved(id: number) {
    const { rows } = await db.query(
      `
      UPDATE password_reset_requests
      SET status = 'RESOLVED', resolved_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, phone, status
      `,
      [id]
    );

    return rows[0] ?? null;
  }
}
