import { db } from "../db/db";
import { CreateOrderRequest } from "../types/order";

export class OrderRepository {
  static async createOrder(
    order: CreateOrderRequest,
    promoterId?: number | null,
    customerId?: number | null
  ) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const now = new Date();

      const orderNumber =
        "BBS" +
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        "-" +
        Date.now().toString().slice(-6);

      const orderResult = await client.query(
        `
        INSERT INTO orders
        (
            order_number,
            customer_name,
            email,
            mobile,
            address,
            city,
            state,
            pincode,
            country,
            gst_number,
            total_amount,
            promoter_id,
            customer_id
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
        )
        RETURNING id, order_number
        `,
        [
          orderNumber,
          order.customer_name,
          order.email,
          order.mobile,
          order.address,
          order.city,
          order.state,
          order.pincode,
          order.country,
          order.gst_number || null,
          order.total_amount,
          promoterId ?? null,
          customerId ?? null,
        ]
      );

      const orderId = orderResult.rows[0].id;

      for (const item of order.items) {
        await client.query(
          `
          INSERT INTO order_items
          (
              order_id,
              book_id,
              quantity,
              price,
              subtotal
          )
          VALUES
          (
              $1,$2,$3,$4,$5
          )
          `,
          [
            orderId,
            item.book_id,
            item.quantity,
            item.price,
            item.price * item.quantity,
          ]
        );
      }

      await client.query("COMMIT");

      return {
        id: orderId,
        orderNumber: orderResult.rows[0].order_number,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async getOrderCount() {
    const { rows } = await db.query(`
      SELECT COUNT(*)::int AS total
      FROM orders
    `);

    return rows[0].total;
  }

  static async getTotalRevenue() {
    const { rows } = await db.query(`
      SELECT COALESCE(SUM(total_amount),0) AS total
      FROM orders
    `);

    return Number(rows[0].total);
  }

  static async getRecentOrders(limit = 5) {
    const { rows } = await db.query(
      `
      SELECT
        id,
        order_number,
        customer_name,
        total_amount,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT $1
      `,
      [limit]
    );

    return rows;
  }

  static async getAllOrders(promoterCode?: string) {
    const params: string[] = [];
    let whereClause = "";

    if (promoterCode) {
      params.push(promoterCode);
      whereClause = `WHERE p.code = $${params.length}`;
    }

    const { rows } = await db.query(
      `
      SELECT
        o.id,
        o.order_number,
        o.customer_name,
        o.email,
        o.total_amount,
        o.order_status,
        o.payment_status,
        o.created_at,
        p.name AS promoter_name,
        p.code AS promoter_code
      FROM orders o
      LEFT JOIN promoters p ON p.id = o.promoter_id
      ${whereClause}
      ORDER BY o.created_at DESC
      `,
      params
    );

    return rows;
  }

  static async getOrderById(id: number) {
    const { rows } = await db.query(
      `
      SELECT
        o.id,
        o.order_number,
        o.customer_name,
        o.email,
        o.mobile,
        o.address,
        o.city,
        o.state,
        o.pincode,
        o.country,
        o.gst_number,
        o.total_amount,
        o.payment_status,
        o.payment_method,
        o.order_status,
        o.created_at,
        p.name AS promoter_name,
        p.code AS promoter_code
      FROM orders o
      LEFT JOIN promoters p ON p.id = o.promoter_id
      WHERE o.id = $1
      `,
      [id]
    );

    return rows[0] ?? null;
  }

  static async getOrderItems(orderId: number) {
    const { rows } = await db.query(
      `
      SELECT
        oi.id,
        oi.book_id,
        b.title AS book_title,
        oi.quantity,
        oi.price,
        oi.subtotal
      FROM order_items oi
      JOIN books b ON b.id = oi.book_id
      WHERE oi.order_id = $1
      ORDER BY oi.id
      `,
      [orderId]
    );

    return rows;
  }

  static async updateOrderStatus(
    id: number,
    updates: {
      order_status?: string;
      payment_status?: string;
    }
  ) {
    const { rows } = await db.query(
      `
      UPDATE orders
      SET
        order_status = COALESCE($2, order_status),
        payment_status = COALESCE($3, payment_status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, order_status, payment_status
      `,
      [
        id,
        updates.order_status ?? null,
        updates.payment_status ?? null,
      ]
    );

    return rows[0] ?? null;
  }

  static async setRazorpayOrderId(
    id: number,
    razorpayOrderId: string
  ) {
    await db.query(
      `UPDATE orders SET razorpay_order_id = $2 WHERE id = $1`,
      [id, razorpayOrderId]
    );
  }

  static async markPaidWithPaymentDetails(
    id: number,
    paymentDetails: {
      paymentId: string;
      paymentMethod: string;
    }
  ) {
    const { rows } = await db.query(
      `
      UPDATE orders
      SET
        payment_status = 'PAID',
        order_status = 'CONFIRMED',
        payment_id = $2,
        payment_method = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, order_number, payment_status, order_status
      `,
      [
        id,
        paymentDetails.paymentId,
        paymentDetails.paymentMethod,
      ]
    );

    return rows[0] ?? null;
  }

  static async getByRazorpayOrderId(razorpayOrderId: string) {
    const { rows } = await db.query(
      `SELECT id, order_number, payment_status FROM orders WHERE razorpay_order_id = $1`,
      [razorpayOrderId]
    );

    return rows[0] ?? null;
  }

  static async hasCustomerPurchasedBook(
    customerId: number,
    bookId: number
  ): Promise<boolean> {
    const { rows } = await db.query(
      `
      SELECT 1
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.customer_id = $1
        AND o.payment_status = 'PAID'
        AND oi.book_id = $2
      LIMIT 1
      `,
      [customerId, bookId]
    );

    return rows.length > 0;
  }

  static async getPurchasedBooksForCustomer(
    customerId: number
  ) {
    const { rows } = await db.query(
      `
      SELECT DISTINCT
        b.id, b.slug, b.title, b.author, b.cover_image
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN books b ON b.id = oi.book_id
      WHERE o.customer_id = $1
        AND o.payment_status = 'PAID'
      ORDER BY b.title ASC
      `,
      [customerId]
    );

    return rows;
  }
}
