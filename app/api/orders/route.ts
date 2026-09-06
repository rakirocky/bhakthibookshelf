import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { OrderService } from "@/app/lib/services/orderService";
import { PromoterRepository } from "@/app/lib/repositories/promoterRepository";
import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { RazorpayService } from "@/app/lib/services/razorpayService";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const cookieStore = await cookies();
    const refCode = cookieStore.get("promoter_ref")?.value;

    let promoterId: number | null = null;

    if (refCode) {
      const promoter = await PromoterRepository.getByCode(
        refCode
      );

      promoterId = promoter?.id ?? null;

      console.log(
        promoter
          ? `[order-create] referral code "${refCode}" matched promoter "${promoter.name}" (id ${promoter.id})`
          : `[order-create] referral code "${refCode}" found in cookie but no active promoter matches it`
      );
    } else {
      console.log(
        "[order-create] no referral cookie present — direct order"
      );
    }

    // customerId will always be set in practice, since /checkout and
    // /api/orders both require a valid session (see proxy.ts) — this
    // fallback to null just means "no order can exist without an
    // account to check it against," not that it currently happens.
    const customerSession = await getCustomerSession();
    const customerId = customerSession?.customerId ?? null;

    console.log(
      customerId
        ? `[order-create] linked to customer account (id ${customerId})`
        : "[order-create] guest checkout — no customer account linked"
    );

    const order = await OrderService.createOrder(
      body,
      promoterId,
      customerId
    );

    console.log(
      `[order-create] order ${order.orderNumber} created` +
        (promoterId
          ? ` — attributed to promoter id ${promoterId}`
          : " — no promoter attribution")
    );

    // Create the matching Razorpay order now, before the customer sees
    // the payment widget — Razorpay requires an order to exist on their
    // side first. If Razorpay genuinely isn't configured yet (no keys
    // in .env.local), fall back to the existing pending-order flow
    // rather than breaking checkout entirely the moment this code
    // ships — the keys can be added later without another deployment.
    // If it IS configured but the API call itself fails (Razorpay is
    // down, bad request), that's surfaced as a real error instead,
    // since in that case a customer would expect to be able to pay.
    let razorpayOrder: { id: string; amount: number; currency: string } | null =
      null;

    try {
      razorpayOrder = await RazorpayService.createOrder({
        amountInRupees: body.total_amount,
        receipt: order.orderNumber,
        notes: {
          order_id: String(order.id),
          order_number: order.orderNumber,
        },
      });

      await OrderService.setRazorpayOrderId(
        order.id,
        razorpayOrder.id
      );

      console.log(
        `[order-create] Razorpay order ${razorpayOrder.id} created for order ${order.orderNumber}`
      );
    } catch (razorpayError) {
      const notConfigured =
        razorpayError instanceof Error &&
        razorpayError.message.includes(
          "Razorpay is not configured"
        );

      if (!notConfigured) {
        // Real failure with real credentials — don't silently swallow
        // this, the customer needs to know payment didn't go through.
        throw razorpayError;
      }

      console.log(
        `[order-create] Razorpay not configured yet — order ${order.orderNumber} created as PENDING without a payment step, same as before this integration existed.`
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder?.id ?? null,
      razorpayKeyId: razorpayOrder
        ? RazorpayService.getPublicKeyId()
        : null,
      amount: razorpayOrder?.amount ?? null,
      currency: razorpayOrder?.currency ?? null,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create order",
      },
      {
        status: 500,
      }
    );
  }
}
