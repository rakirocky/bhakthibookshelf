import { NextResponse } from "next/server";

import { OrderService } from "@/app/lib/services/orderService";
import { SettingsService } from "@/app/lib/services/settingsService";
import { generateInvoicePdf } from "@/app/lib/services/invoiceService";
import { sendEmail } from "@/app/lib/services/emailService";

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

    const settings = await SettingsService.getSettings();

    const pdfBuffer = await generateInvoicePdf(
      order as any,
      settings
    );

    const html = `
      <div style="font-family: Arial, sans-serif; color: #222;">
        <h2 style="color: #d97706;">${settings.store_name}</h2>
        <p>Hi ${order.customer_name},</p>
        <p>
          Thank you for your order — your payment has been
          received and your invoice is attached.
        </p>
        <p>
          <strong>Order #:</strong> ${order.order_number}<br />
          <strong>Amount:</strong> ₹${order.total_amount}
        </p>
        <p>If you have any questions, just reply to this email.</p>
        <p>Thank you for shopping with ${settings.store_name}.</p>
      </div>
    `;

    await sendEmail({
      to: order.email,
      subject: `${settings.store_name} - Payment Successful`,
      html,
      attachments: [
        {
          filename: `invoice-${order.order_number}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

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
