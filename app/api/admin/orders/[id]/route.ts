import { NextResponse } from "next/server";

import { OrderService } from "@/app/lib/services/orderService";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const updated = await OrderService.updateOrderStatus(
      Number(id),
      {
        order_status: body.order_status,
        payment_status: body.payment_status,
      }
    );

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Update failed",
      },
      {
        status: 400,
      }
    );
  }
}
