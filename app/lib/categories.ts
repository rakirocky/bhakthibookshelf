import type { I18nKey } from "./i18n/dictionary";

/** Book categories — the Library chips, footer links and admin dropdown. */
export const BOOK_CATEGORIES = ["scriptures", "epics", "prayers", "devotional"] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];

export const CATEGORY_LABEL: Record<BookCategory, I18nKey> = {
  scriptures: "footer.scriptures",
  epics: "footer.epics",
  prayers: "footer.prayers",
  devotional: "footer.devotional",
};

/** Anything else (empty, unknown, tampered) becomes "no category". */
export function normalizeCategory(value: unknown): BookCategory | null {
  const v = String(value ?? "").trim().toLowerCase();
  return (BOOK_CATEGORIES as readonly string[]).includes(v) ? (v as BookCategory) : null;
}
