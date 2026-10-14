import { SettingsService } from "./settingsService";
import {
  formatInvoiceNumber,
  generateInvoicePdf,
  generateSubscriptionInvoicePdf,
} from "./invoiceService";
import { sendEmail } from "./emailService";

// Payment-successful email with the invoice PDF attached. Shared by the
// automatic send when an order first becomes PAID and the admin's
// manual "Email invoice" button.
export async function sendPaymentConfirmationEmail(order: {
  order_number: string;
  customer_name: string;
  email: string;
  total_amount: number | string;
  invoice_no?: number | null;
  invoiced_at?: string | null;
}) {
  const settings = await SettingsService.getSettings();

  const pdfBuffer = await generateInvoicePdf(
    order as any,
    settings
  );

  const invoiceNumber = formatInvoiceNumber(
    "EB",
    order.invoice_no,
    order.invoiced_at
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
          ${invoiceNumber ? `<strong>Invoice #:</strong> ${invoiceNumber}<br />` : ""}
          <strong>Order #:</strong> ${order.order_number}<br />
          <strong>Amount:</strong> ₹${order.total_amount}
        </p>
        <p>
          Your books are now in your library — sign in at
          <a href="https://bhakthibookshelf.in/downloads">bhakthibookshelf.in/downloads</a>
          or in the Bhakthi Bookshelf app to read them.
        </p>
        <p>If you have any questions, just reply to this email.</p>
        <p style="margin-top: 24px; padding: 14px 18px; background: #fff4e0; border: 2px solid #d97706; border-radius: 8px; text-align: center; font-size: 17px; font-weight: bold; color: #b45309;">
          Thank you for shopping with ${settings.store_name}!
        </p>
      </div>
    `;

  await sendEmail({
    to: order.email,
    subject: `${settings.store_name} - Payment Successful`,
    html,
    attachments: [
      {
        filename: `invoice-${invoiceNumber ?? order.order_number}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}

// Lifetime-plan purchase email with its GST invoice. Sent once, when the
// subscription first becomes PAID (see SubscriptionService).
export async function sendSubscriptionInvoiceEmail(
  sub: Parameters<typeof generateSubscriptionInvoicePdf>[0]
) {
  if (!sub.customer_email) return false;

  const settings = await SettingsService.getSettings();
  const pdfBuffer = await generateSubscriptionInvoicePdf(sub, settings);
  const invoiceNumber = formatInvoiceNumber(
    "LT",
    sub.invoice_no,
    sub.invoiced_at
  );

  const html = `
      <div style="font-family: Arial, sans-serif; color: #222;">
        <h2 style="color: #d97706;">${settings.store_name}</h2>
        <p>Hi ${sub.customer_name ?? ""},</p>
        <p>
          Thank you — your payment has been received and your
          lifetime access is now active. Your invoice is attached.
        </p>
        <p>
          ${invoiceNumber ? `<strong>Invoice #:</strong> ${invoiceNumber}<br />` : ""}
          <strong>Plan:</strong> ${sub.plan_name}<br />
          <strong>Amount:</strong> ₹${sub.amount}
        </p>
        <p>
          Every book is now open to you — sign in at
          <a href="https://bhakthibookshelf.in/books">bhakthibookshelf.in</a>
          or in the Bhakthi Bookshelf app to read.
        </p>
        <p>If you have any questions, just reply to this email.</p>
        <p style="margin-top: 24px; padding: 14px 18px; background: #fff4e0; border: 2px solid #d97706; border-radius: 8px; text-align: center; font-size: 17px; font-weight: bold; color: #b45309;">
          Thank you for shopping with ${settings.store_name}!
        </p>
      </div>
    `;

  await sendEmail({
    to: sub.customer_email,
    subject: `${settings.store_name} - Payment Successful`,
    html,
    attachments: [
      {
        filename: `invoice-${invoiceNumber ?? `subscription-${sub.id}`}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  return true;
}
