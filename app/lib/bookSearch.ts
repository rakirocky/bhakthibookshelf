/**
 * Shared book matching for the Library filter and the header search:
 * every word typed must appear somewhere in the title, subtitle, author
 * or description (case-insensitive; works for Kannada text too).
 */
export interface SearchableBook {
  title: string;
  subtitle?: string | null;
  author?: string | null;
  description?: string | null;
}

export function matchesQuery(book: SearchableBook, query: string): boolean {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = [book.title, book.subtitle, book.author, book.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return words.every((w) => haystack.includes(w));
}

/** Rank title hits above author/description-only hits. */
export function searchScore(book: SearchableBook, query: string): number {
  const q = query.trim().toLowerCase();
  const title = book.title.toLowerCase();
  if (title.startsWith(q)) return 3;
  if (title.includes(q)) return 2;
  if ((book.author ?? "").toLowerCase().includes(q)) return 1;
  return 0;
}
