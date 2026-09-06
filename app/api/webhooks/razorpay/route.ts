import { NextResponse } from "next/server";

import { RazorpayService } from "@/app/lib/services/razorpayService";
import { OrderService } from "@/app/lib/services/orderService";
import { SubscriptionService } from "@/app/lib/services/subscriptionService";

export async function POST(request: Request) {
  // Signature verification needs the exact raw bytes Razorpay sent —
  // request.json() would parse and lose the original formatting,
  // making the signature never match even for a genuine webhook.
  const rawBody = await request.text();

  const signature = request.headers.get(
    "x-razorpay-signature"
  );

  const isValid = RazorpayService.verifyWebhookSignature(
    rawBody,
    signature
  );

  if (!isValid) {
    console.error(
      "[razorpay-webhook] signature verification failed — ignoring. Either RAZORPAY_WEBHOOK_SECRET is misconfigured, or this wasn't genuinely from Razorpay."
    );

    return NextResponse.json(
      { success: false, message: "Invalid signature." },
      { status: 400 }
    );
  }

  let payload: any;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid payload." },
      { status: 400 }
    );
  }

  const event = payload.event;

  console.log(`[razorpay-webhook] received event: ${event}`);

  // Only act on a captured (successfully completed) payment. Other
  // events (payment.failed, order.paid, etc.) are logged but not acted
  // on here — deliberately narrow scope, matching exactly what the
  // client-side verification path also does.
  if (event !== "payment.captured") {
    return NextResponse.json({ success: true, ignored: true });
  }

  try {
    const paymentEntity = payload.payload?.payment?.entity;

    const razorpayOrderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (!razorpayOrderId || !paymentId) {
      return NextResponse.json(
        { success: false, message: "Malformed payload." },
        { status: 400 }
      );
    }

    // Could be either a book order or a subscription — check both.
    const order = await OrderService.getByRazorpayOrderId(
      razorpayOrderId
    );

    if (order) {
      if (order.payment_status === "PAID") {
        // Already marked paid, almost certainly by the client-side
        // verification path already firing first — this is expected
        // and fine, not an error. The webhook is a backstop, not
        // always the first to arrive.
        console.log(
          `[razorpay-webhook] order ${order.order_number} already PAID — no action needed`
        );
      } else {
        await OrderService.markPaidWithPaymentDetails(
          order.id,
          {
            paymentId,
            paymentMethod: "razorpay",
          }
        );

        console.log(
          `[razorpay-webhook] order ${order.order_number} marked PAID via webhook (client-side verification likely never completed)`
        );
      }

      return NextResponse.json({ success: true });
    }

    const subscription =
      await SubscriptionService.getByRazorpayOrderId(
        razorpayOrderId
      );

    if (subscription) {
      if (subscription.payment_status === "PAID") {
        console.log(
          `[razorpay-webhook] subscription ${subscription.id} already PAID — no action needed`
        );
      } else {
        await SubscriptionService.markPaid(
          subscription.id,
          {
            paymentId,
            paymentMethod: "razorpay",
          }
        );

        console.log(
          `[razorpay-webhook] subscription ${subscription.id} marked PAID via webhook`
        );
      }

      return NextResponse.json({ success: true });
    }

    console.error(
      `[razorpay-webhook] payment captured for razorpay_order_id ${razorpayOrderId}, but no matching order or subscription found in our database.`
    );

    return NextResponse.json(
      { success: false, message: "No matching order." },
      { status: 404 }
    );
  } catch (error) {
    console.error("[razorpay-webhook] error:", error);

    return NextResponse.json(
      { success: false, message: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
