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

  // Soft delete, not a hard DELETE — matches `subscribe`'s ON CONFLICT
  // reactivation (a former subscriber re-subscribing with the same
  // email flips is_active back to TRUE on the same row rather than
  // erroring on a duplicate) and keeps the row as a record that this
  // email was once subscribed and was removed.
  static async deactivate(id: number) {
    const { rows } = await db.query(
      `
      UPDATE newsletter_subscribers
      SET is_active = FALSE
      WHERE id = $1
      RETURNING id, email
      `,
      [id]
    );

    return rows[0] ?? null;
  }
}
