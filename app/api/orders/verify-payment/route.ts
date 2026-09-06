import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { OrderService } from "@/app/lib/services/orderService";
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
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await request.json();

    if (
      !orderId ||
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

    const order = await OrderService.getOrderDetail(
      Number(orderId)
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    // Ownership check — being logged in only proves who you are, not
    // that this specific order is yours. Same reasoning as the invoice
    // download endpoint.
    if (order.customer_id !== session.customerId) {
      console.log(
        `[payment-verify] denied — customer ${session.phone} tried to verify payment for order ${order.id} belonging to a different account`
      );

      return NextResponse.json(
        {
          success: false,
          message: "This order doesn't belong to you.",
        },
        { status: 403 }
      );
    }

    // The actual security check. Everything above this point is just
    // routing and ownership — this line is what actually decides
    // whether real money is considered received. Never skip it, never
    // trust razorpay_payment_id alone just because the client sent one.
    const isValid = RazorpayService.verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isValid) {
      console.error(
        `[payment-verify] SIGNATURE MISMATCH — order ${order.id}, claimed payment ${razorpay_payment_id}. This either means a bug, or someone attempting to fake a payment. Order was NOT marked paid.`
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment verification failed. If money was deducted, contact support with your order number.",
        },
        { status: 400 }
      );
    }

    const updated =
      await OrderService.markPaidWithPaymentDetails(
        order.id,
        {
          paymentId: razorpay_payment_id,
          paymentMethod: "razorpay",
        }
      );

    console.log(
      `[payment-verify] order ${order.order_number} marked PAID — payment ${razorpay_payment_id}`
    );

    return NextResponse.json({
      success: true,
      orderNumber: updated?.order_number,
    });
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
