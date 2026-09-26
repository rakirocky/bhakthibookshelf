import { db } from "../db/db";

/** Wishlist rows are keyed by book id but spoken to the browser in slugs. */
export class WishlistRepository {
  /** Slugs of the customer's saved books that are still published, newest first. */
  static async getSlugs(customerId: number): Promise<string[]> {
    const { rows } = await db.query(
      `
      SELECT b.slug
      FROM wishlist_items w
      JOIN books b ON b.id = w.book_id
      WHERE w.customer_id = $1
        AND b.published = TRUE
      ORDER BY w.created_at DESC
      `,
      [customerId]
    );

    return rows.map((r) => r.slug as string);
  }

  /** Adds published books by slug; unknown slugs and duplicates are ignored. */
  static async addSlugs(customerId: number, slugs: string[]): Promise<void> {
    if (slugs.length === 0) return;

    await db.query(
      `
      INSERT INTO wishlist_items (customer_id, book_id)
      SELECT $1, b.id
      FROM books b
      WHERE b.slug = ANY($2::text[])
        AND b.published = TRUE
      ON CONFLICT DO NOTHING
      `,
      [customerId, slugs]
    );
  }

  static async removeSlug(customerId: number, slug: string): Promise<void> {
    await db.query(
      `
      DELETE FROM wishlist_items w
      USING books b
      WHERE w.book_id = b.id
        AND w.customer_id = $1
        AND b.slug = $2
      `,
      [customerId, slug]
    );
  }
}
