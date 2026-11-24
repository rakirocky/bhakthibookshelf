import "server-only";

import { db } from "../db/db";
import { CustomerRepository } from "../repositories/customerRepository";
import { OrderRepository } from "../repositories/orderRepository";
import { SubscriptionRepository } from "../repositories/subscriptionRepository";
import { OrderService } from "./orderService";
import { SubscriptionService } from "./subscriptionService";
import {
  acknowledgeProductPurchase,
  customerIdFromAccountToken,
  getProductPurchase,
  parseProductId,
  PURCHASE_STATE,
  type ProductPurchase,
} from "./googlePlayService";

export type GrantResult =
  | { status: "granted"; orderNumber?: string; subscriptionId?: number; already: boolean }
  | { status: "pending" }
  | { status: "rejected"; reason: string; httpStatus: number };

const STORE = "google_play";

/**
 * Turns a verified Google Play purchase into a normal PAID order (book) or
 * subscription (lifetime plan). Safe to call any number of times for the
 * same token — from the app right after buying, from a restore on next
 * launch, and from Google's notification — only the first call grants.
 *
 * Google is the only source of truth: the token is looked up with the
 * Play Developer API, and the buyer is whoever our HMAC account token
 * (set when the purchase started) says, never what the app claims.
 */
export async function processGooglePurchase(input: {
  productId: string;
  purchaseToken: string;
  /** Logged-in customer making the call; null for notifications. */
  sessionCustomerId: number | null;
  source: "app" | "restore" | "rtdn";
}): Promise<GrantResult> {
  const { productId, purchaseToken, sessionCustomerId, source } = input;
  const tag = `[google-play:${source}]`;

  const product = parseProductId(productId);
  if (!product || !purchaseToken || purchaseToken.length > 4096) {
    return { status: "rejected", reason: "Unknown product.", httpStatus: 400 };
  }

  const purchase = await getProductPurchase(productId, purchaseToken);
  if (!purchase) {
    console.error(`${tag} token not recognised by Google for ${productId}`);
    return {
      status: "rejected",
      reason: "Google Play did not recognise this purchase.",
      httpStatus: 400,
    };
  }

  const customerId = customerIdFromAccountToken(
    purchase.obfuscatedExternalAccountId
  );
  if (!customerId) {
    console.error(
      `${tag} purchase ${purchase.orderId} has no valid account token — not granted`
    );
    return {
      status: "rejected",
      reason: "This purchase isn't linked to a Bhakthi Bookshelf account. Please contact support.",
      httpStatus: 400,
    };
  }
  if (sessionCustomerId && sessionCustomerId !== customerId) {
    console.error(
      `${tag} purchase ${purchase.orderId} belongs to customer ${customerId}, caller is ${sessionCustomerId}`
    );
    return {
      status: "rejected",
      reason: "This purchase was made while signed in to a different account.",
      httpStatus: 403,
    };
  }

  if (purchase.purchaseState === PURCHASE_STATE.PENDING) {
    await upsertRow(purchaseToken, productId, purchase, customerId, "PENDING");
    console.log(`${tag} ${purchase.orderId} is PENDING (payment not completed yet)`);
    return { status: "pending" };
  }
  if (purchase.purchaseState !== PURCHASE_STATE.PURCHASED) {
    return {
      status: "rejected",
      reason: "This purchase was cancelled.",
      httpStatus: 400,
    };
  }

  // One grant per token even across pm2 workers: a DB-level lock on the
  // token, held while we check and create.
  const lock = await db.connect();
  try {
    await lock.query("SELECT pg_advisory_lock(hashtext($1))", [
      `${STORE}:${purchaseToken}`,
    ]);

    const existing = await db.query(
      `SELECT order_id, subscription_id, state FROM store_purchases
       WHERE store = $1 AND purchase_token = $2`,
      [STORE, purchaseToken]
    );
    const row = existing.rows[0];

    if (row && row.state === "REFUNDED") {
      return { status: "rejected", reason: "This purchase was refunded.", httpStatus: 400 };
    }

    let result: GrantResult;

    if (row && (row.order_id || row.subscription_id)) {
      result = { status: "granted", already: true };
      if (row.order_id) {
        const o = await OrderRepository.getOrderById(Number(row.order_id));
        result.orderNumber = o?.order_number;
      } else {
        result.subscriptionId = Number(row.subscription_id);
      }
    } else if (product.kind === "book") {
      const orderId = await createPaidBookOrder(customerId, product.id, purchase);
      await upsertRow(purchaseToken, productId, purchase, customerId, "PURCHASED", { orderId });
      const o = await OrderRepository.getOrderById(orderId);
      result = { status: "granted", orderNumber: o?.order_number, already: false };
      console.log(`${tag} ${purchase.orderId} → order ${o?.order_number} PAID (customer ${customerId})`);
    } else {
      const subscriptionId = await createPaidSubscription(customerId, product.id, purchase);
      await upsertRow(purchaseToken, productId, purchase, customerId, "PURCHASED", { subscriptionId });
      result = { status: "granted", subscriptionId, already: false };
      console.log(`${tag} ${purchase.orderId} → subscription ${subscriptionId} PAID (customer ${customerId})`);
    }

    // Acknowledge only after access is recorded; unacknowledged purchases
    // are refunded by Google after 3 days, so a failure here is retried
    // by the next restore/notification rather than failing the grant.
    if (purchase.acknowledgementState !== 1) {
      try {
        await acknowledgeProductPurchase(productId, purchaseToken);
        await db.query(
          `UPDATE store_purchases SET acknowledged_at = CURRENT_TIMESTAMP
           WHERE store = $1 AND purchase_token = $2`,
          [STORE, purchaseToken]
        );
      } catch (error) {
        console.error(`${tag} acknowledge FAILED for ${purchase.orderId}:`, error);
      }
    }

    return result;
  } finally {
    await lock
      .query("SELECT pg_advisory_unlock(hashtext($1))", [`${STORE}:${purchaseToken}`])
      .catch(() => {});
    lock.release();
  }
}

/** Google refunded / charged back / revoked a purchase: take access away. */
export async function revokeGooglePurchase(purchaseToken: string, reason: string) {
  const { rows } = await db.query(
    `UPDATE store_purchases
     SET state = 'REFUNDED', voided_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE store = $1 AND purchase_token = $2
     RETURNING order_id, subscription_id, store_order_id`,
    [STORE, purchaseToken]
  );
  const row = rows[0];
  if (!row) {
    console.log(`[google-play:void] unknown token (${reason}) — nothing to revoke`);
    return;
  }
  if (row.order_id) {
    await db.query(
      `UPDATE orders SET payment_status = 'REFUNDED', order_status = 'CANCELLED',
         updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [row.order_id]
    );
  }
  if (row.subscription_id) {
    await db.query(
      `UPDATE subscriptions SET payment_status = 'REFUNDED', ends_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [row.subscription_id]
    );
  }
  console.log(
    `[google-play:void] ${row.store_order_id} revoked (${reason}) — order ${row.order_id ?? "-"}, subscription ${row.subscription_id ?? "-"}`
  );
}

/* ---------- helpers ---------- */

async function upsertRow(
  purchaseToken: string,
  productId: string,
  purchase: ProductPurchase,
  customerId: number,
  state: "PURCHASED" | "PENDING",
  link: { orderId?: number; subscriptionId?: number } = {}
) {
  await db.query(
    `INSERT INTO store_purchases
       (store, purchase_token, product_id, store_order_id, customer_id,
        order_id, subscription_id, state, raw)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (store, purchase_token) DO UPDATE SET
       state = CASE WHEN store_purchases.state = 'REFUNDED' THEN 'REFUNDED' ELSE EXCLUDED.state END,
       store_order_id = COALESCE(EXCLUDED.store_order_id, store_purchases.store_order_id),
       order_id = COALESCE(store_purchases.order_id, EXCLUDED.order_id),
       subscription_id = COALESCE(store_purchases.subscription_id, EXCLUDED.subscription_id),
       raw = EXCLUDED.raw,
       updated_at = CURRENT_TIMESTAMP`,
    [
      STORE,
      purchaseToken,
      productId,
      purchase.orderId ?? null,
      customerId,
      link.orderId ?? null,
      link.subscriptionId ?? null,
      state,
      JSON.stringify(purchase),
    ]
  );
}

async function createPaidBookOrder(
  customerId: number,
  bookId: number,
  purchase: ProductPurchase
): Promise<number> {
  const customer = await CustomerRepository.getById(customerId);
  if (!customer) throw new Error(`customer ${customerId} not found`);

  // The book may have been unpublished after the customer paid — they
  // still get it, so read it regardless of `published`.
  const { rows } = await db.query(
    `SELECT id, COALESCE(discount_price, price)::numeric AS price
     FROM books WHERE id = $1`,
    [bookId]
  );
  if (!rows[0]) throw new Error(`book ${bookId} not found`);
  const price = Number(rows[0].price);

  const promoterId = await CustomerRepository.getReferralPromoterId(customerId);

  const created = await OrderRepository.createOrder(
    {
      customer_name: customer.name || "Customer",
      email: customer.email || "",
      mobile: customer.phone || "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: purchase.regionCode === "IN" || !purchase.regionCode ? "India" : purchase.regionCode,
      total_amount: price,
      items: [{ book_id: bookId, quantity: 1, price }],
    },
    promoterId,
    customerId
  );

  // Same path as a Razorpay payment: sets PAID, invoice number (trigger),
  // confirmation email.
  await OrderService.markPaidWithPaymentDetails(created.id, {
    paymentId: purchase.orderId || "google_play",
    paymentMethod: "google_play",
  });

  return created.id;
}

async function createPaidSubscription(
  customerId: number,
  planId: number,
  purchase: ProductPurchase
): Promise<number> {
  const plan = await SubscriptionRepository.getPlanById(planId);
  if (!plan) throw new Error(`plan ${planId} not found`);

  const promoterId = await CustomerRepository.getReferralPromoterId(customerId);
  const created = await SubscriptionRepository.create({
    customerId,
    planId,
    amount: plan.price,
    promoterId,
  });

  await SubscriptionService.markPaid(created.id, {
    paymentId: purchase.orderId || "google_play",
    paymentMethod: "google_play",
  });

  return Number(created.id);
}
