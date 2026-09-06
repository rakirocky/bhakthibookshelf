import Razorpay from "razorpay";
import crypto from "crypto";

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local."
    );
  }

  return { keyId, keySecret };
}

function getClient() {
  const { keyId, keySecret } = getCredentials();

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export class RazorpayService {
  /**
   * Creates an order on Razorpay's side before the checkout widget opens.
   * `receipt` should be our own order/subscription number, so it's easy
   * to cross-reference in the Razorpay dashboard later.
   */
  static async createOrder(params: {
    amountInRupees: number;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<{
    id: string;
    amount: number;
    currency: string;
  }> {
    const client = getClient();

    // Razorpay works in the smallest currency unit — paise, not rupees.
    // ₹499.50 must be sent as 49950, not 499.5 — Razorpay would reject
    // a non-integer amount outright.
    const amountInPaise = Math.round(
      params.amountInRupees * 100
    );

    const order = await client.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes,
    });

    // The SDK types `amount` as string | number (Razorpay's API can
    // return either depending on context) — normalized to a guaranteed
    // number right here, so every caller gets a consistent shape
    // instead of each one having to handle both possibilities.
    return {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
    };
  }

  /**
   * Verifies that a payment callback genuinely came from Razorpay and
   * wasn't fabricated by a malicious client. This is the single most
   * important function in the whole payment feature — an order must
   * NEVER be marked paid based on the browser's word alone. Razorpay's
   * documented algorithm: HMAC-SHA256 of "order_id|payment_id", signed
   * with the key secret, must match what the client reports.
   */
  static verifyPaymentSignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): boolean {
    const { keySecret } = getCredentials();

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(
        `${params.razorpayOrderId}|${params.razorpayPaymentId}`
      )
      .digest("hex");

    return safeCompare(
      expectedSignature,
      params.razorpaySignature
    );
  }

  /**
   * Verifies an incoming webhook is genuinely from Razorpay, using the
   * separate Webhook Secret (configured in the Razorpay dashboard, not
   * the same as the API key secret). Must be run against the exact raw
   * request body — parsing to JSON and re-stringifying first would
   * produce a different byte sequence and fail verification even for a
   * genuine webhook.
   */
  static verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | null
  ): boolean {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret || !signatureHeader) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    return safeCompare(expectedSignature, signatureHeader);
  }

  static getPublicKeyId(): string {
    return getCredentials().keyId;
  }
}

// Constant-time string comparison — prevents a timing-attack from
// gradually revealing the correct signature one character at a time.
// Regular === comparison exits early on the first mismatched
// character, which measurably leaks information via response timing.
function safeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}
