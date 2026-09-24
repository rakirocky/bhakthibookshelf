import { NextResponse } from "next/server";

import { OrderService } from "@/app/lib/services/orderService";
import { sendPaymentConfirmationEmail } from "@/app/lib/services/orderEmailService";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const order = await OrderService.getOrderDetail(
      Number(id)
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    await sendPaymentConfirmationEmail(order);

    console.log(
      `[email-invoice] sent to ${order.email} for order ${order.order_number}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to send invoice email.",
      },
      { status: 500 }
    );
  }
}
