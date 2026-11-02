/**
 * Book-language filter (All / English / ಕನ್ನಡ) — client-safe. This only
 * picks which books are shown; the interface language is separate, so a
 * reader can keep the site in English and still browse Kannada books.
 */
export const BOOK_LANGUAGES = ["all", "English", "Kannada"] as const;

export type BookLanguage = (typeof BOOK_LANGUAGES)[number];

// Match a language however it was typed ("English", "en", "ENGLISH ")
// so a stray value can't silently drop a book from the language filter
// (migration 026 normalized the existing rows).
export function languageAliases(language: string): string[] {
  const l = language.trim().toLowerCase();
  if (l === "english" || l === "en") return ["english", "en", "eng"];
  if (l === "kannada" || l === "kn") return ["kannada", "kn", "kan"];
  return [l];
}

/** URL/cookie value → filter value; anything unknown means "all". */
export function normalizeBookLanguage(value: unknown): BookLanguage {
  const aliases = languageAliases(String(value ?? ""));
  if (aliases.includes("english")) return "English";
  if (aliases.includes("kannada")) return "Kannada";
  return "all";
}

export function bookMatchesLanguage(
  bookLanguage: string | null | undefined,
  filter: BookLanguage
): boolean {
  if (filter === "all") return true;
  return languageAliases(filter).includes(String(bookLanguage ?? "").trim().toLowerCase());
}
