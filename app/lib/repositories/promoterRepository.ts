import "server-only";

import { db } from "../db/db";

export class PromoterRepository {
  static async getAllWithStats() {
    // Orders and subscriptions are aggregated in separate subqueries
    // before joining — joining both directly to promoters in one query
    // would multiply rows (every order paired with every subscription
    // for that promoter) and silently inflate every total.
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
        COALESCE(sub_stats.paid_subscription_count, 0) AS paid_subscription_count,
        COALESCE(sub_stats.paid_subscription_revenue, 0) AS paid_subscription_revenue
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
          promoter_id,
          COUNT(*) FILTER (WHERE payment_status = 'PAID') AS paid_subscription_count,
          SUM(amount) FILTER (WHERE payment_status = 'PAID') AS paid_subscription_revenue
        FROM subscriptions
        WHERE promoter_id IS NOT NULL
        GROUP BY promoter_id
      ) sub_stats ON sub_stats.promoter_id = p.id
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

  static async getByCode(code: string) {
    const { rows } = await db.query(
      `
      SELECT id, name, code, commission_rate, is_active
      FROM promoters
      WHERE code = $1 AND is_active = TRUE
      `,
      [code]
    );

    return rows[0] ?? null;
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
