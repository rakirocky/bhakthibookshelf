import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { PromoterRepository } from "@/app/lib/repositories/promoterRepository";
import { SubscriptionService } from "@/app/lib/services/subscriptionService";
import { RazorpayService } from "@/app/lib/services/razorpayService";

export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const { planId } = await request.json();

    const cookieStore = await cookies();
    const refCode = cookieStore.get("promoter_ref")?.value;

    let promoterId: number | null = null;

    if (refCode) {
      const promoter = await PromoterRepository.getByCode(
        refCode
      );

      promoterId = promoter?.id ?? null;
    }

    const subscription = await SubscriptionService.purchase(
      session.customerId,
      Number(planId),
      promoterId
    );

    console.log(
      `[subscription-create] customer ${session.phone} subscribed to plan ${planId}` +
        (promoterId
          ? ` — attributed to promoter id ${promoterId}`
          : " — no promoter attribution")
    );

    let razorpayOrder: { id: string; amount: number; currency: string } | null =
      null;

    try {
      razorpayOrder = await RazorpayService.createOrder({
        amountInRupees: subscription.amount,
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

    return NextResponse.json({
      success: true,
      subscription,
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
