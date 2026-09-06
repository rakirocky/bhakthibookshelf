import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
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

    const {
      subscriptionId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await request.json();

    if (
      !subscriptionId ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing payment verification details.",
        },
        { status: 400 }
      );
    }

    const subscription = await SubscriptionService.getById(
      Number(subscriptionId)
    );

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription not found.",
        },
        { status: 404 }
      );
    }

    if (subscription.customer_id !== session.customerId) {
      console.log(
        `[subscription-payment-verify] denied — customer ${session.phone} tried to verify payment for subscription ${subscription.id} belonging to a different account`
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "This subscription doesn't belong to you.",
        },
        { status: 403 }
      );
    }

    const isValid = RazorpayService.verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isValid) {
      console.error(
        `[subscription-payment-verify] SIGNATURE MISMATCH — subscription ${subscription.id}, claimed payment ${razorpay_payment_id}. Not activated.`
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment verification failed. If money was deducted, contact support.",
        },
        { status: 400 }
      );
    }

    // Same method the admin "Mark Paid" button uses — guarantees
    // identical behavior (setting starts_at/ends_at correctly)
    // regardless of whether payment was confirmed by Razorpay or
    // manually by an admin.
    await SubscriptionService.markPaid(subscription.id, {
      paymentId: razorpay_payment_id,
      paymentMethod: "razorpay",
    });

    console.log(
      `[subscription-payment-verify] subscription ${subscription.id} marked PAID — payment ${razorpay_payment_id}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}
