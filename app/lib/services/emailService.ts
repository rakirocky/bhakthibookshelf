import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD in .env.local — see CHANGES.md."
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    // Port 465 is SSL from the start; 587 (the common one, including
    // Gmail) upgrades to TLS after connecting — nodemailer needs to know
    // which mode to use.
    secure: port === 465,
    auth: { user, pass },
  });
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}) {
  const transporter = getTransporter();

  const fromEmail =
    process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const fromName =
    process.env.SMTP_FROM_NAME || "Bhakthi Bookshelf";

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  });
}
