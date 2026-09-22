import "server-only";

import { db } from "../db/db";

// `months` here is always an internal, hardcoded call (see ReportsService),
// never a value taken from a request — so interpolating it straight into
// the INTERVAL literal is safe and avoids fighting Postgres's int/interval
// cast resolution for a parameterized version.
export class ReportsRepository {
  // Combined order + subscription revenue, PAID only, one row per month,
  // zero-filled for months with no revenue (LEFT JOIN against a generated
  // month series rather than GROUP BY on the raw rows).
  static async getMonthlyRevenue(months = 12) {
    const { rows } = await db.query(`
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', CURRENT_DATE) - INTERVAL '${months - 1} months',
          date_trunc('month', CURRENT_DATE),
          INTERVAL '1 month'
        ) AS month
      ),
      order_rev AS (
        SELECT date_trunc('month', created_at) AS month, SUM(total_amount) AS amt
        FROM orders
        WHERE payment_status = 'PAID'
        GROUP BY 1
      ),
      sub_rev AS (
        SELECT date_trunc('month', created_at) AS month, SUM(amount) AS amt
        FROM subscriptions
        WHERE payment_status = 'PAID'
        GROUP BY 1
      )
      SELECT
        to_char(m.month, 'Mon YYYY') AS label,
        COALESCE(o.amt, 0) + COALESCE(s.amt, 0) AS revenue
      FROM months m
      LEFT JOIN order_rev o ON o.month = m.month
      LEFT JOIN sub_rev s ON s.month = m.month
      ORDER BY m.month
    `);

    return rows.map((r) => ({
      label: r.label as string,
      revenue: Number(r.revenue),
    }));
  }

  static async getMonthlyCustomerGrowth(months = 12) {
    const { rows } = await db.query(`
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', CURRENT_DATE) - INTERVAL '${months - 1} months',
          date_trunc('month', CURRENT_DATE),
          INTERVAL '1 month'
        ) AS month
      )
      SELECT
        to_char(m.month, 'Mon YYYY') AS label,
        COUNT(c.id)::int AS new_customers
      FROM months m
      LEFT JOIN customers c ON date_trunc('month', c.created_at) = m.month
      GROUP BY m.month
      ORDER BY m.month
    `);

    return rows as { label: string; new_customers: number }[];
  }

  // PAID order_items only — same reasoning as OrderRepository.getTotalRevenue,
  // a PENDING/FAILED order was never actually sold.
  static async getTopBooks(limit = 10) {
    const { rows } = await db.query(
      `
      SELECT
        b.id,
        b.title,
        b.author,
        COALESCE(SUM(oi.quantity), 0)::int AS copies_sold,
        COALESCE(SUM(oi.subtotal), 0) AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id AND o.payment_status = 'PAID'
      JOIN books b ON b.id = oi.book_id
      GROUP BY b.id, b.title, b.author
      ORDER BY revenue DESC
      LIMIT $1
      `,
      [limit]
    );

    return rows.map((r) => ({ ...r, revenue: Number(r.revenue) }));
  }

  static async getSubscriptionBreakdown() {
    const { rows } = await db.query(`
      SELECT
        p.id,
        p.name,
        COUNT(s.id) FILTER (WHERE s.payment_status = 'PAID')::int AS paid_count,
        COALESCE(SUM(s.amount) FILTER (WHERE s.payment_status = 'PAID'), 0) AS revenue
      FROM subscription_plans p
      LEFT JOIN subscriptions s ON s.plan_id = p.id
      GROUP BY p.id, p.name, p.price
      ORDER BY p.price ASC
    `);

    return rows.map((r) => ({ ...r, revenue: Number(r.revenue) }));
  }

  // "Conversion" here means active customer accounts that have ever paid
  // for a subscription — the closest thing this app has to a funnel, since
  // there's no separate "trial"/"lead" stage to measure against.
  static async getConversionStats() {
    const { rows } = await db.query(`
      SELECT
        (SELECT COUNT(*)::int FROM customers WHERE is_active = true) AS total_customers,
        (SELECT COUNT(DISTINCT customer_id)::int FROM subscriptions WHERE payment_status = 'PAID') AS subscribed_customers
    `);

    return rows[0] as {
      total_customers: number;
      subscribed_customers: number;
    };
  }
}
