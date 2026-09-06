import "server-only";

import { db } from "../db/db";

export class ContactMessageRepository {
  static async create(data: {
    name: string;
    email: string;
    message: string;
  }) {
    const { rows } = await db.query(
      `
      INSERT INTO contact_messages (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, message, is_read, created_at
      `,
      [data.name, data.email, data.message]
    );

    return rows[0];
  }

  static async getAll() {
    const { rows } = await db.query(`
      SELECT id, name, email, message, is_read, created_at
      FROM contact_messages
      ORDER BY created_at DESC
    `);

    return rows;
  }

  static async markRead(id: number) {
    const { rows } = await db.query(
      `
      UPDATE contact_messages
      SET is_read = TRUE
      WHERE id = $1
      RETURNING id, is_read
      `,
      [id]
    );

    return rows[0] ?? null;
  }
}
