import { SettingsService } from "./settingsService";
import { generateInvoicePdf } from "./invoiceService";
import { sendEmail } from "./emailService";

// Payment-successful email with the invoice PDF attached. Shared by the
// automatic send when an order first becomes PAID and the admin's
// manual "Email invoice" button.
export async function sendPaymentConfirmationEmail(order: {
  order_number: string;
  customer_name: string;
  email: string;
  total_amount: number | string;
}) {
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
        <p>
          Your books are now in your library — sign in at
          <a href="https://bhakthibookshelf.in/downloads">bhakthibookshelf.in/downloads</a>
          or in the Bhakthi Bookshelf app to read them.
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
}
