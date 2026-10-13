import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { CustomerRepository } from "@/app/lib/repositories/customerRepository";
import { PromoterRepository } from "@/app/lib/repositories/promoterRepository";
import { SubscriptionService } from "@/app/lib/services/subscriptionService";
import { RazorpayService } from "@/app/lib/services/razorpayService";
import { checkRequestRateLimit } from "@/app/lib/services/requestRateLimitService";

export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const rateLimit = checkRequestRateLimit(
      `customer:${session.customerId}`,
      { max: 5, windowMs: 5 * 60 * 1000 }
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many attempts. Please try again shortly.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const { planId } = await request.json();

    // Same attribution priority as order creation: the account's
    // durable referral binding wins, falling back to the promoter_ref
    // cookie only if the account was never attributed.
    let promoterId: number | null =
      await CustomerRepository.getReferralPromoterId(
        session.customerId
      );

    if (!promoterId) {
      const cookieStore = await cookies();
      const refCode = cookieStore.get("promoter_ref")?.value;

      if (refCode) {
        const promoter = await PromoterRepository.getByCode(
          refCode
        );

        promoterId = promoter?.id ?? null;
      }
    }

    const subscription = await SubscriptionService.purchase(
      session.customerId,
      Number(planId),
      promoterId
    );

    console.log(
      `[subscription-create] customer ${session.phone} ${subscription.reused ? `resumed unpaid subscription ${subscription.id}` : `subscribed to plan ${planId}`}` +
        (promoterId
          ? ` — attributed to promoter id ${promoterId}`
          : " — no promoter attribution")
    );

    let razorpayOrder: { id: string; amount: number; currency: string } | null =
      null;

    // Resuming: pay against the Razorpay order already on this
    // subscription (same amount — purchase() only reuses on a price match).
    const existingOrderId =
      subscription.reused && "razorpay_order_id" in subscription
        ? (subscription.razorpay_order_id as string | null)
        : null;

    if (existingOrderId) {
      razorpayOrder = {
        id: existingOrderId,
        amount: Math.round(Number(subscription.amount) * 100),
        currency: "INR",
      };
    } else {
      try {
        razorpayOrder = await RazorpayService.createOrder({
          amountInRupees: Number(subscription.amount),
          receipt: `sub-${subscription.id}`,
          notes: {
            subscription_id: String(subscription.id),
            customer_phone: session.phone,
          },
        });

        await SubscriptionService.setRazorpayOrderId(
          subscription.id,
          razorpayOrder.id
        );

        console.log(
          `[subscription-create] Razorpay order ${razorpayOrder.id} created for subscription ${subscription.id}`
        );
      } catch (razorpayError) {
        const notConfigured =
          razorpayError instanceof Error &&
          razorpayError.message.includes(
            "Razorpay is not configured"
          );

        if (!notConfigured) {
          throw razorpayError;
        }

        console.log(
          `[subscription-create] Razorpay not configured yet — subscription ${subscription.id} created as PENDING, same as before this integration existed.`
        );
      }
    }

    // Passed to Razorpay so its window opens straight on the payment
    // options — without it Razorpay first asks for a mobile number.
    const customer = razorpayOrder
      ? await CustomerRepository.getById(session.customerId)
      : null;

    return NextResponse.json({
      success: true,
      subscription,
      prefill: customer
        ? {
            name: customer.name ?? "",
            email: customer.email ?? "",
            contact: customer.phone,
          }
        : null,
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
            : "Unable to subscribe.",
      },
      { status: 400 }
    );
  }
}
