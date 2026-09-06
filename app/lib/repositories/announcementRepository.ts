import "server-only";

import { db } from "../db/db";

export class AnnouncementRepository {
  static async getActive() {
    const { rows } = await db.query(`
      SELECT id, message, link, created_at
      FROM announcements
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `);

    return rows;
  }

  static async getAll() {
    const { rows } = await db.query(`
      SELECT id, message, link, is_active, created_at
      FROM announcements
      ORDER BY created_at DESC
    `);

    return rows;
  }

  static async create(data: {
    message: string;
    link?: string | null;
  }) {
    const { rows } = await db.query(
      `
      INSERT INTO announcements (message, link)
      VALUES ($1, $2)
      RETURNING id, message, link, is_active, created_at
      `,
      [data.message, data.link ?? null]
    );

    return rows[0];
  }

  static async setActive(id: number, isActive: boolean) {
    const { rows } = await db.query(
      `
      UPDATE announcements
      SET is_active = $2
      WHERE id = $1
      RETURNING id, is_active
      `,
      [id, isActive]
    );

    return rows[0] ?? null;
  }

  static async delete(id: number) {
    await db.query(
      `DELETE FROM announcements WHERE id = $1`,
      [id]
    );
  }
}
