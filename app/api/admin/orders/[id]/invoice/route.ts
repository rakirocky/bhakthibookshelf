import { NextResponse } from "next/server";

import { OrderService } from "@/app/lib/services/orderService";
import { SettingsService } from "@/app/lib/services/settingsService";
import { generateInvoicePdf } from "@/app/lib/services/invoiceService";

export async function GET(
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

    const settings = await SettingsService.getSettings();

    const pdfBuffer = await generateInvoicePdf(
      order as any,
      settings
    );

    console.log(
      `[invoice] generated for order ${order.order_number}`
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${order.order_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate invoice.",
      },
      { status: 500 }
    );
  }
}
