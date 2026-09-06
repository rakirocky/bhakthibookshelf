import { ContactMessageRepository } from "../repositories/contactMessageRepository";
import { SettingsService } from "./settingsService";
import { sendEmail } from "./emailService";

export class ContactMessageService {
  static async submit(data: {
    name: string;
    email: string;
    message: string;
  }) {
    if (!data.name?.trim()) {
      throw new Error("Name is required.");
    }

    if (!data.email?.trim()) {
      throw new Error("Email is required.");
    }

    if (!data.message?.trim()) {
      throw new Error("Message is required.");
    }

    const saved = await ContactMessageRepository.create({
      name: data.name.trim(),
      email: data.email.trim(),
      message: data.message.trim(),
    });

    // Best-effort notification — the message is already saved above
    // regardless of whether this succeeds, so a missing/broken SMTP
    // setup never loses a customer's message.
    try {
      const settings = await SettingsService.getSettings();

      if (settings.contact_email) {
        await sendEmail({
          to: settings.contact_email,
          subject: `New contact form message from ${saved.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #222;">
              <h2 style="color: #d97706;">New Contact Message</h2>
              <p><strong>From:</strong> ${saved.name} (${saved.email})</p>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${saved.message}</p>
            </div>
          `,
        });
      }
    } catch (error) {
      console.log(
        "[contact-message] saved but email notification failed (SMTP likely not configured):",
        error instanceof Error ? error.message : error
      );
    }

    return saved;
  }

  static async getAll() {
    return ContactMessageRepository.getAll();
  }

  static async markRead(id: number) {
    return ContactMessageRepository.markRead(id);
  }
}
