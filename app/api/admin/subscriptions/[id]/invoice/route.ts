import { NextResponse } from "next/server";

import { SubscriptionService } from "@/app/lib/services/subscriptionService";
import { SettingsService } from "@/app/lib/services/settingsService";
import {
  formatInvoiceNumber,
  generateSubscriptionInvoicePdf,
} from "@/app/lib/services/invoiceService";

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

    const sub = await SubscriptionService.getInvoiceData(Number(id));

    if (!sub) {
      return NextResponse.json(
        { success: false, message: "Subscription not found." },
        { status: 404 }
      );
    }

    const settings = await SettingsService.getSettings();

    const pdfBuffer = await generateSubscriptionInvoicePdf(sub, settings);

    const invoiceNumber =
      formatInvoiceNumber("LT", sub.invoice_no, sub.invoiced_at) ?? `subscription-${sub.id}`;

    console.log(`[invoice] generated ${invoiceNumber} for subscription ${sub.id}`);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoiceNumber}.pdf"`,
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
