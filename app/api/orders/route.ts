import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { OrderService } from "@/app/lib/services/orderService";
import { CustomerRepository } from "@/app/lib/repositories/customerRepository";
import { PromoterRepository } from "@/app/lib/repositories/promoterRepository";
import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { RazorpayService } from "@/app/lib/services/razorpayService";
import {
  checkRequestRateLimit,
  getClientIp,
} from "@/app/lib/services/requestRateLimitService";

export async function POST(request: Request) {
  try {
    // Guest checkout means we can't always key this off a customer id,
    // so a session (once known below) takes priority and IP is the
    // fallback — a scripted burst of order-creation requests would
    // otherwise hit Razorpay's API and the DB with no throttle at all.
    const preAuthSession = await getCustomerSession();
    const rateLimitKey = preAuthSession
      ? `customer:${preAuthSession.customerId}`
      : `ip:${getClientIp(request)}`;

    const rateLimit = checkRequestRateLimit(rateLimitKey, {
      max: 10,
      windowMs: 5 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many order attempts. Please try again shortly.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const body = await request.json();

    // proxy.ts only checks that the JWT is well-formed — it can't see
    // that a newer login has superseded it (single-session, migration
    // 024). getCustomerSession() is the authoritative check, so refuse
    // here rather than create an account-less order: that order could
    // still be paid, but would never show up in anyone's library, and
    // verify-payment would 401 right after the money was taken.
    if (!preAuthSession) {
      return NextResponse.json(
        {
          success: false,
          code: "SESSION_EXPIRED",
          message:
            "Your session has expired. Please sign in again to complete your purchase.",
        },
        { status: 401 }
      );
    }

    const customerId = preAuthSession.customerId;

    // The account's own durable referral binding (set at signup/login,
    // see PromoterService.attributeCustomerReferral) is the primary
    // source of attribution — it's permanent, unlike the promoter_ref
    // cookie, which only covers 30 days from the last ?ref= visit. The
    // cookie is only consulted as a fallback, for an account that was
    // never attributed (e.g. it predates this feature, or the customer
    // never typed/clicked a referral code).
    let promoterId: number | null = customerId
      ? await CustomerRepository.getReferralPromoterId(customerId)
      : null;

    if (promoterId) {
      console.log(
        `[order-create] customer account already attributed to promoter id ${promoterId}`
      );
    } else {
      const cookieStore = await cookies();
      const refCode = cookieStore.get("promoter_ref")?.value;

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
          "[order-create] no account attribution and no referral cookie — direct order"
        );
      }
    }

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
