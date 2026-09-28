import { cache } from "react";
import { revalidateTag } from "next/cache";

import { AnnouncementRepository } from "../repositories/announcementRepository";

// Read on every page (root layout) and by /api/announcements. Per-request
// only — see the note in book-service.ts (2-process cluster): an admin
// switching an announcement on/off must show on both processes at once.
const getActiveCached = cache(async () => AnnouncementRepository.getActive());

export class AnnouncementService {
  static async getActive() {
    return getActiveCached();
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

    const created = await AnnouncementRepository.create({
      message: data.message.trim(),
      link: data.link?.trim() || null,
    });
    revalidateTag("announcements", { expire: 0 });
    return created;
  }

  static async setActive(id: number, isActive: boolean) {
    const updated = await AnnouncementRepository.setActive(
      id,
      isActive
    );

    if (!updated) {
      throw new Error("Announcement not found.");
    }

    revalidateTag("announcements", { expire: 0 });
    return updated;
  }

  static async delete(id: number) {
    const deleted = await AnnouncementRepository.delete(id);
    revalidateTag("announcements", { expire: 0 });
    return deleted;
  }
}
