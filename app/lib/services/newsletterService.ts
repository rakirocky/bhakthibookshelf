import { NewsletterRepository } from "../repositories/newsletterRepository";
import { sendEmail } from "./emailService";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export class NewsletterService {
  // Sends one-by-one (never CC/BCC) so subscribers never see each
  // other's addresses. A failed send doesn't stop the rest — the admin
  // gets a sent/failed count back instead of a single all-or-nothing error.
  static async broadcast(subject: string, message: string) {
    const cleanSubject = subject?.trim();
    const cleanMessage = message?.trim();

    if (!cleanSubject) {
      throw new Error("Subject is required.");
    }

    if (!cleanMessage) {
      throw new Error("Message is required.");
    }

    const subscribers = await NewsletterRepository.getAllActive();

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      try {
        await sendEmail({
          to: subscriber.email,
          subject: cleanSubject,
          html: `
            <div style="font-family: Arial, sans-serif; color: #222; max-width: 600px;">
              <h2 style="color: #d97706;">Bhakthi Bookshelf</h2>
              <div style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(cleanMessage)}</div>
              <p style="margin-top: 30px; font-size: 12px; color: #999;">
                You're receiving this because you subscribed at bhakthibookshelf.in.
                Contact us if you'd like to be removed from this list.
              </p>
            </div>
          `,
        });

        sent += 1;
      } catch (error) {
        console.error(
          `[newsletter-broadcast] failed to email ${subscriber.email}:`,
          error instanceof Error ? error.message : error
        );

        failed += 1;
      }
    }

    return { total: subscribers.length, sent, failed };
  }
}
