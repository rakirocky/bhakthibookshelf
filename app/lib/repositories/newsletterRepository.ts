import "server-only";

import { db } from "../db/db";

export class NewsletterRepository {
  static async subscribe(email: string) {
    const { rows } = await db.query(
      `
      INSERT INTO newsletter_subscribers (email)
      VALUES ($1)
      ON CONFLICT (email)
      DO UPDATE SET is_active = TRUE
      RETURNING id, email, created_at
      `,
      [email]
    );

    return rows[0];
  }

  static async getAllActive() {
    const { rows } = await db.query(`
      SELECT id, email, created_at
      FROM newsletter_subscribers
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `);

    return rows;
  }
}
