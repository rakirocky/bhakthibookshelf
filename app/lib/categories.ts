import type { I18nKey } from "./i18n/dictionary";

/** Book categories — the Library chips, footer links and admin dropdown. */
export const BOOK_CATEGORIES = [
  "scriptures",
  "epics",
  "prayers",
  "divine-stories",
  "other",
] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];

export const CATEGORY_LABEL: Record<BookCategory, I18nKey> = {
  scriptures: "footer.scriptures",
  epics: "footer.epics",
  prayers: "footer.prayers",
  "divine-stories": "footer.divineStories",
  other: "footer.other",
};

/** Anything else (empty, unknown, tampered) becomes "no category". */
export function normalizeCategory(value: unknown): BookCategory | null {
  const v = String(value ?? "").trim().toLowerCase();
  return (BOOK_CATEGORIES as readonly string[]).includes(v) ? (v as BookCategory) : null;
}
