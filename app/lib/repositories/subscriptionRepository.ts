import "server-only";

import { db } from "../db/db";

export class SubscriptionRepository {
  static async getActivePlans() {
    const { rows } = await db.query(`
      SELECT id, name, price, duration_days, is_active
      FROM subscription_plans
      WHERE is_active = TRUE
      ORDER BY price ASC
    `);

    return rows;
  }

  static async getPlanById(id: number) {
    const { rows } = await db.query(
      `
      SELECT id, name, price, duration_days, is_active
      FROM subscription_plans
      WHERE id = $1
      `,
      [id]
    );

    return rows[0] ?? null;
  }

  static async create(data: {
    customerId: number;
    planId: number;
    amount: number;
    promoterId?: number | null;
  }) {
    const { rows } = await db.query(
      `
      INSERT INTO subscriptions
        (customer_id, plan_id, amount, promoter_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, customer_id, plan_id, amount, payment_status, created_at
      `,
      [
        data.customerId,
        data.planId,
        data.amount,
        data.promoterId ?? null,
      ]
    );

    return rows[0];
  }

  static async getActiveForCustomer(customerId: number) {
    const { rows } = await db.query(
      `
      SELECT
        s.id, s.customer_id, s.plan_id, s.amount,
        s.payment_status, s.starts_at, s.ends_at, s.created_at,
        p.name AS plan_name
      FROM subscriptions s
      JOIN subscription_plans p ON p.id = s.plan_id
      WHERE s.customer_id = $1
        AND s.payment_status = 'PAID'
        AND s.ends_at > CURRENT_TIMESTAMP
      ORDER BY s.ends_at DESC
      LIMIT 1
      `,
      [customerId]
    );

    return rows[0] ?? null;
  }

  static async getLatestForCustomer(customerId: number) {
    const { rows } = await db.query(
      `
      SELECT
        s.id, s.customer_id, s.plan_id, s.amount,
        s.payment_status, s.starts_at, s.ends_at, s.created_at,
        p.name AS plan_name
      FROM subscriptions s
      JOIN subscription_plans p ON p.id = s.plan_id
      WHERE s.customer_id = $1
      ORDER BY s.created_at DESC
      LIMIT 1
      `,
      [customerId]
    );

    return rows[0] ?? null;
  }

  static async getAllForAdmin(promoterCode?: string) {
    const params: string[] = [];
    let whereClause = "";

    if (promoterCode) {
      params.push(promoterCode);
      whereClause = `WHERE pr.code = $${params.length}`;
    }

    const { rows } = await db.query(
      `
      SELECT
        s.id, s.customer_id, s.plan_id, s.amount,
        s.payment_status, s.starts_at, s.ends_at, s.created_at,
        p.name AS plan_name,
        c.name AS customer_name,
        c.phone AS customer_phone,
        pr.name AS promoter_name,
        pr.code AS promoter_code
      FROM subscriptions s
      JOIN subscription_plans p ON p.id = s.plan_id
      JOIN customers c ON c.id = s.customer_id
      LEFT JOIN promoters pr ON pr.id = s.promoter_id
      ${whereClause}
      ORDER BY s.created_at DESC
      `,
      params
    );

    return rows;
  }

  static async markPaid(
    id: number,
    paymentDetails?: {
      paymentId?: string;
      paymentMethod?: string;
      razorpayOrderId?: string;
    }
  ) {
    const { rows } = await db.query(
      `
      UPDATE subscriptions s
      SET
        payment_status = 'PAID',
        starts_at = CURRENT_TIMESTAMP,
        ends_at = CURRENT_TIMESTAMP +
          (
            SELECT (duration_days || ' days')::interval
            FROM subscription_plans
            WHERE id = s.plan_id
          ),
        payment_id = COALESCE($2, payment_id),
        payment_method = COALESCE($3, payment_method),
        razorpay_order_id = COALESCE($4, razorpay_order_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE s.id = $1
      RETURNING id, payment_status, starts_at, ends_at
      `,
      [
        id,
        paymentDetails?.paymentId ?? null,
        paymentDetails?.paymentMethod ?? null,
        paymentDetails?.razorpayOrderId ?? null,
      ]
    );

    return rows[0] ?? null;
  }

  static async setRazorpayOrderId(
    id: number,
    razorpayOrderId: string
  ) {
    await db.query(
      `UPDATE subscriptions SET razorpay_order_id = $2 WHERE id = $1`,
      [id, razorpayOrderId]
    );
  }

  static async getById(id: number) {
    const { rows } = await db.query(
      `
      SELECT
        s.id, s.customer_id, s.plan_id, s.amount,
        s.payment_status, s.razorpay_order_id,
        p.name AS plan_name
      FROM subscriptions s
      JOIN subscription_plans p ON p.id = s.plan_id
      WHERE s.id = $1
      `,
      [id]
    );

    return rows[0] ?? null;
  }

  static async getByRazorpayOrderId(razorpayOrderId: string) {
    const { rows } = await db.query(
      `SELECT id, payment_status FROM subscriptions WHERE razorpay_order_id = $1`,
      [razorpayOrderId]
    );

    return rows[0] ?? null;
  }
}
