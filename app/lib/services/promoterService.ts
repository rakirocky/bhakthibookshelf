import { PromoterRepository } from "../repositories/promoterRepository";
import { CreatePromoterRequest } from "../types/promoter";

const CODE_REGEX = /^[a-z0-9-]{3,50}$/;

export class PromoterService {
  static async getAllWithStats() {
    return PromoterRepository.getAllWithStats();
  }

  static async create(data: CreatePromoterRequest) {
    if (!data.name?.trim()) {
      throw new Error("Promoter name is required.");
    }

    const cleanCode = data.code?.trim().toLowerCase();

    if (!cleanCode || !CODE_REGEX.test(cleanCode)) {
      throw new Error(
        "Referral code must be 3-50 characters: lowercase letters, numbers, and hyphens only."
      );
    }

    const existing = await PromoterRepository.getByCode(
      cleanCode
    );

    if (existing) {
      throw new Error(
        "That referral code is already in use."
      );
    }

    const rate =
      data.commission_rate === undefined
        ? 10
        : Number(data.commission_rate);

    if (Number.isNaN(rate) || rate < 0 || rate > 100) {
      throw new Error(
        "Commission rate must be between 0 and 100."
      );
    }

    const created = await PromoterRepository.create({
      name: data.name.trim(),
      code: cleanCode,
      contactPhone: data.contact_phone?.trim() || null,
      contactEmail: data.contact_email?.trim() || null,
      commissionRate: rate,
    });

    console.log(
      `[promoter-create] created "${created.name}" with code "${created.code}" (id ${created.id})`
    );

    return created;
  }

  static async setActive(id: number, isActive: boolean) {
    const updated = await PromoterRepository.setActive(
      id,
      isActive
    );

    if (!updated) {
      throw new Error("Promoter not found.");
    }

    return updated;
  }
}
