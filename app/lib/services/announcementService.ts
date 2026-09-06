import { AnnouncementRepository } from "../repositories/announcementRepository";

export class AnnouncementService {
  static async getActive() {
    return AnnouncementRepository.getActive();
  }

  static async getAll() {
    return AnnouncementRepository.getAll();
  }

  static async create(data: {
    message: string;
    link?: string;
  }) {
    if (!data.message?.trim()) {
      throw new Error("Message is required.");
    }

    return AnnouncementRepository.create({
      message: data.message.trim(),
      link: data.link?.trim() || null,
    });
  }

  static async setActive(id: number, isActive: boolean) {
    const updated = await AnnouncementRepository.setActive(
      id,
      isActive
    );

    if (!updated) {
      throw new Error("Announcement not found.");
    }

    return updated;
  }

  static async delete(id: number) {
    return AnnouncementRepository.delete(id);
  }
}
