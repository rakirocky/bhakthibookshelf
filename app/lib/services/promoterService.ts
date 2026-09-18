import { CustomerRepository } from "../repositories/customerRepository";
import { PromoterRepository } from "../repositories/promoterRepository";
import {
  CreatePromoterRequest,
  ReferralAttributionResult,
} from "../types/promoter";

const CODE_REGEX = /^[a-z0-9-]{3,50}$/;

export class PromoterService {
  // Shared by signup and login: a customer types (or arrives with, via
  // ?ref=) a referral code, and this attributes their account to that
  // promoter — permanently, first-touch (see
  // CustomerRepository.attributeReferral). Safe to call on every login
  // with whatever code is available; it's a no-op once an account is
  // already attributed.
  static async attributeCustomerReferral(
    customerId: number,
    rawCode?: string | null
  ): Promise<ReferralAttributionResult> {
    if (!rawCode) {
      return { applied: false, reason: "no-code" };
    }

    const code = rawCode.trim().toLowerCase();

    if (!CODE_REGEX.test(code)) {
      return { applied: false, reason: "invalid-format" };
    }

    const promoter = await PromoterRepository.getByCode(code);

    if (!promoter) {
      return { applied: false, reason: "unknown-code" };
    }

    const applied = await CustomerRepository.attributeReferral(
      customerId,
      promoter.id
    );

    if (!applied) {
      return { applied: false, reason: "already-attributed" };
    }

    console.log(
      `[promoter-referral] customer #${customerId} attributed to promoter "${promoter.name}" (id ${promoter.id}) via code "${code}"`
    );

    return {
      applied: true,
      promoter: { id: promoter.id, name: promoter.name },
    };
  }

  static async getAllWithStats() {
    return PromoterRepository.getAllWithStats();
  }

  static async create(data: CreatePromoterRequest) {
    if (!data.name?.trim()) {
      throw new Error("Promoter name is required.");
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

    const name = data.name.trim();
    const code = await PromoterService.generateCode(name);

    const created = await PromoterRepository.create({
      name,
      code,
      contactPhone: data.contact_phone?.trim() || null,
      contactEmail: data.contact_email?.trim() || null,
      commissionRate: rate,
    });

    console.log(
      `[promoter-create] created "${created.name}" with code "${created.code}" (id ${created.id})`
    );

    return created;
  }

  // Referral codes are branded, not chosen: always "BB" + a prefix of
  // the promoter's name (letters only, uppercased), starting at 3
  // letters and growing one letter at a time until it's unique —
  // "Lakshmi" -> BBLAK, and a second "Lakshmi..." -> BBLAKS, BBLAKSH,
  // etc. If every prefix length of the name is already taken (e.g. two
  // promoters with the literal same name), falls back to a numbered
  // suffix on the fullest prefix so this always terminates with a
  // unique code.
  static async generateCode(name: string): Promise<string> {
    const letters = name.toUpperCase().replace(/[^A-Z]/g, "");
    const base = letters || "PROMOTER";
    const startLen = Math.min(3, base.length);

    for (let len = startLen; len <= base.length; len++) {
      const candidate = `BB${base.slice(0, len)}`;

      if (!(await PromoterRepository.codeExists(candidate))) {
        return candidate;
      }
    }

    const fullPrefix = `BB${base}`;

    for (let suffix = 2; ; suffix++) {
      const candidate = `${fullPrefix}${suffix}`;

      if (!(await PromoterRepository.codeExists(candidate))) {
        return candidate;
      }
    }
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
