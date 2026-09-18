import "server-only";

import { db } from "../db/db";

export class PromoterRepository {
  static async getAllWithStats() {
    // Orders, order_items (for the book count), subscriptions, and
    // referred customers are each aggregated in their own subquery
    // before joining — joining them all directly to promoters in one
    // query would multiply rows (every order paired with every
    // subscription and every order_item for that promoter) and
    // silently inflate every total.
    const { rows } = await db.query(`
      SELECT
        p.id,
        p.name,
        p.code,
        p.contact_phone,
        p.contact_email,
        p.commission_rate,
        p.is_active,
        p.created_at,
        COALESCE(order_stats.paid_order_count, 0) AS paid_order_count,
        COALESCE(order_stats.paid_order_revenue, 0) AS paid_order_revenue,
        COALESCE(book_stats.paid_book_count, 0) AS paid_book_count,
        COALESCE(sub_stats.paid_subscription_count, 0) AS paid_subscription_count,
        COALESCE(sub_stats.paid_subscription_revenue, 0) AS paid_subscription_revenue,
        COALESCE(referral_stats.referred_customer_count, 0) AS referred_customer_count
      FROM promoters p
      LEFT JOIN (
        SELECT
          promoter_id,
          COUNT(*) FILTER (WHERE payment_status = 'PAID') AS paid_order_count,
          SUM(total_amount) FILTER (WHERE payment_status = 'PAID') AS paid_order_revenue
        FROM orders
        WHERE promoter_id IS NOT NULL
        GROUP BY promoter_id
      ) order_stats ON order_stats.promoter_id = p.id
      LEFT JOIN (
        SELECT
          o.promoter_id,
          SUM(oi.quantity) AS paid_book_count
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.promoter_id IS NOT NULL AND o.payment_status = 'PAID'
        GROUP BY o.promoter_id
      ) book_stats ON book_stats.promoter_id = p.id
      LEFT JOIN (
        SELECT
          promoter_id,
          COUNT(*) FILTER (WHERE payment_status = 'PAID') AS paid_subscription_count,
          SUM(amount) FILTER (WHERE payment_status = 'PAID') AS paid_subscription_revenue
        FROM subscriptions
        WHERE promoter_id IS NOT NULL
        GROUP BY promoter_id
      ) sub_stats ON sub_stats.promoter_id = p.id
      LEFT JOIN (
        SELECT
          referred_by_promoter_id AS promoter_id,
          COUNT(*) AS referred_customer_count
        FROM customers
        WHERE referred_by_promoter_id IS NOT NULL
        GROUP BY referred_by_promoter_id
      ) referral_stats ON referral_stats.promoter_id = p.id
      ORDER BY p.created_at DESC
    `);

    return rows.map((row) => {
      const totalRevenue =
        Number(row.paid_order_revenue) +
        Number(row.paid_subscription_revenue);

      return {
        ...row,
        paid_revenue: totalRevenue,
        commission_owed:
          (totalRevenue * Number(row.commission_rate)) /
          100,
      };
    });
  }

  // Case-insensitive on purpose: codes are now generated uppercase
  // (see PromoterService.generateCode) but a customer can type/paste one
  // in any case, and older codes created before this convention are
  // still lowercase — both need to resolve the same promoter.
  static async getByCode(code: string) {
    const { rows } = await db.query(
      `
      SELECT id, name, code, commission_rate, is_active
      FROM promoters
      WHERE UPPER(code) = UPPER($1) AND is_active = TRUE
      `,
      [code]
    );

    return rows[0] ?? null;
  }

  // Unlike getByCode, this ignores is_active — a deactivated promoter's
  // code must still count as "taken" so a new promoter is never
  // generated a code that collides with one that already exists.
  static async codeExists(code: string): Promise<boolean> {
    const { rows } = await db.query(
      `
      SELECT 1
      FROM promoters
      WHERE UPPER(code) = UPPER($1)
      LIMIT 1
      `,
      [code]
    );

    return rows.length > 0;
  }

  static async create(data: {
    name: string;
    code: string;
    contactPhone?: string | null;
    contactEmail?: string | null;
    commissionRate: number;
  }) {
    const { rows } = await db.query(
      `
      INSERT INTO promoters
        (name, code, contact_phone, contact_email, commission_rate)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, code
      `,
      [
        data.name,
        data.code,
        data.contactPhone ?? null,
        data.contactEmail ?? null,
        data.commissionRate,
      ]
    );

    return rows[0];
  }

  static async setActive(id: number, isActive: boolean) {
    const { rows } = await db.query(
      `
      UPDATE promoters
      SET is_active = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, is_active
      `,
      [id, isActive]
    );

    return rows[0] ?? null;
  }
}
