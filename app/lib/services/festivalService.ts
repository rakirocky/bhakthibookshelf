import "server-only";

import { revalidateTag, unstable_cache } from "next/cache";

import {
  FESTIVAL_KINDS,
  isFestivalKey,
  type Festival,
} from "@/app/data/festivals";
import { FestivalRepository, type FestivalDateRow } from "../repositories/festivalRepository";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

function toFestival(row: FestivalDateRow): Festival | null {
  if (!isFestivalKey(row.festival_key)) return null; // a key removed from the code
  return {
    ...FESTIVAL_KINDS[row.festival_key],
    key: row.festival_key,
    from: row.start_date,
    ...(row.end_date && row.end_date !== row.start_date ? { to: row.end_date } : {}),
  };
}

// Read by the home page on every request; written only from
// Admin → Festivals, which revalidates the tag.
const getAllCached = unstable_cache(
  async () => FestivalRepository.getAll(),
  ["festivals", "all"],
  { tags: ["festivals"], revalidate: 3600 }
);

function validDate(value: unknown): value is string {
  return typeof value === "string" && YMD.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export class FestivalService {
  /** Every festival on file, oldest first, with its texts attached. */
  static async getFestivals(): Promise<Festival[]> {
    try {
      const rows = await getAllCached();
      return rows.map(toFestival).filter((f): f is Festival => f !== null);
    } catch (error) {
      // the shloka card must never take the home page down
      console.error("FestivalService.getFestivals failed:", error);
      return [];
    }
  }

  /** Admin list: raw rows (uncached). */
  static async getAllRows() {
    return FestivalRepository.getAll();
  }

  static async create(data: { festivalKey?: unknown; start?: unknown; end?: unknown }) {
    if (!isFestivalKey(data.festivalKey)) {
      throw new Error("Choose a festival.");
    }
    if (!validDate(data.start)) {
      throw new Error("Enter a valid start date.");
    }
    const end = data.end === "" || data.end == null ? null : data.end;
    if (end !== null && !validDate(end)) {
      throw new Error("Enter a valid end date, or leave it empty for a one-day festival.");
    }
    if (end !== null && end < data.start) {
      throw new Error("The end date can't be before the start date.");
    }
    if (end !== null && (Date.parse(end) - Date.parse(data.start)) / 86_400_000 > 15) {
      throw new Error("A festival can span at most 16 days.");
    }

    // one festival per day — the home card can only show one
    const clash = await FestivalRepository.findOverlapping(data.start, end ?? data.start);
    if (clash.length > 0) {
      const c = clash[0];
      const name = isFestivalKey(c.festival_key) ? FESTIVAL_KINDS[c.festival_key].name.en : c.festival_key;
      throw new Error(
        `Those dates overlap ${name} (${c.start_date}${c.end_date ? ` – ${c.end_date}` : ""}). Delete or change that one first.`
      );
    }

    const created = await FestivalRepository.create({
      festivalKey: data.festivalKey,
      start: data.start,
      end: end === data.start ? null : end,
    });
    revalidateTag("festivals", { expire: 0 });
    return created;
  }

  static async delete(id: number) {
    await FestivalRepository.delete(id);
    revalidateTag("festivals", { expire: 0 });
  }
}
