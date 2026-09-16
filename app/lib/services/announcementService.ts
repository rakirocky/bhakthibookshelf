import { revalidateTag, unstable_cache } from "next/cache";

import { AnnouncementRepository } from "../repositories/announcementRepository";

// Read on every page (root layout) but written only from /admin/announcements
// — cache the DB read (data cache, not route/page caching) so a hot path hit
// by every visitor doesn't do a Postgres round-trip each time. Invalidated
// instantly on any admin write via revalidateTag below, 60s ceiling otherwise.
const getActiveCached = unstable_cache(
  async () => AnnouncementRepository.getActive(),
  ["announcements", "active"],
  { tags: ["announcements"], revalidate: 60 }
);

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
