import "server-only";

import { cache } from "react";
import { revalidateTag } from "next/cache";

import * as repository from "../repositories/bookRepository";
import { normalizeCategory } from "../categories";

// Per-request dedupe only (React cache), NOT Next's cross-request data
// cache: the site runs as a 2-process pm2 cluster, and revalidateTag()
// only clears the cache in the process that handled the admin's write —
// the other process would keep serving a deleted/edited book for up to
// the TTL. These queries take a few ms on the local Postgres, so reading
// fresh on every request is the simple, correct choice.
export const getAllBooks = cache(
  async (language?: string) => repository.findAllBooks(language)
);

export const getFeaturedBooks = cache(
  async (language?: string) => repository.findFeaturedBooks(language)
);

// The homepage's "Featured Books" section otherwise renders an empty grid
// whenever no admin has ticked "featured" on any book — falls back to the
// newest published books so the section is never blank in practice.
const FEATURED_FALLBACK_LIMIT = 8;

export async function getFeaturedBooksOrLatest(language?: string) {
  const featured = await getFeaturedBooks(language);
  if (featured.length > 0) {
    return featured;
  }

  const latest = await getAllBooks(language);
  return latest.slice(0, FEATURED_FALLBACK_LIMIT);
}

export const getBookBySlug = cache(
  async (slug: string) => repository.findBookBySlug(slug)
);

/**
 * "You may also like" on a book page: other published books ranked by
 * how closely they match this one — same category, then same author,
 * then same language, featured as a tie-breaker; otherwise newest first
 * (getAllBooks' order). Books in `excludeIds` (ones the customer
 * already owns) are left out.
 */
export async function getRelatedBooks(
  current: { slug: string; category?: string | null; author?: string | null; language?: string | null },
  limit = 4,
  language?: string,
  excludeIds: ReadonlySet<number> = new Set()
) {
  const books = await getAllBooks(language);
  const category = normalizeCategory(current.category);
  const author = String(current.author ?? "").trim().toLowerCase();
  const bookLanguage = String(current.language ?? "").trim().toLowerCase();

  const score = (book: (typeof books)[number]) =>
    (category && normalizeCategory(book.category) === category ? 4 : 0) +
    (author && String(book.author ?? "").trim().toLowerCase() === author ? 2 : 0) +
    (bookLanguage && String(book.language ?? "").trim().toLowerCase() === bookLanguage ? 1 : 0) +
    (book.featured ? 0.5 : 0);

  return books
    .filter((book) => book.slug !== current.slug && !excludeIds.has(Number(book.id)))
    .map((book, index) => ({ book, index, score: score(book) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ book }) => book);
}

export async function getDashboardBookCount() {
  return repository.getBookCount();
}

export async function getDashboardLatestBooks() {
  return repository.getLatestBooks();
}

/* ---------- ADMIN ---------- */

export async function getAdminBooks() {
  return repository.getAdminBooks();
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(title: string) {
  const base = slugify(title) || "book";

  let candidate = base;
  let suffix = 2;

  // Keep trying candidate-2, candidate-3, etc. until we find one that's
  // not already taken — titles like "Bhagavad Gita" repeating across
  // different editions is a real scenario, not just a hypothetical.
  while (await repository.findBookBySlug(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix++;
  }

  return candidate;
}

export async function createBook(book: {
  slug?: string;
  title: string;
  author: string;
  description: string;
  price: number;
  cover_image: string;
  sample_pdf: string;
  full_pdf: string;
  featured: boolean;
  published: boolean;
  language: string;
  category?: string | null;
}) {
  // The admin form no longer asks for a slug at all — generated here,
  // from the title, guaranteed unique. Whatever the client sends for
  // `slug` (nothing, now) is ignored on purpose for new books.
  const slug = await generateUniqueSlug(book.title);

  const created = await repository.createBook({
    ...book,
    slug,
    category: normalizeCategory(book.category),
  });
  revalidateTag("books", { expire: 0 });
  return created;
}
export async function getBookById(id: number) {
  return repository.getBookById(id);
}

export async function updateBook(
  id: number,
  book: any
) {
  const updated = await repository.updateBook(id, {
    ...book,
    category: normalizeCategory(book.category),
  });
  revalidateTag("books", { expire: 0 });
  return updated;
}

export async function countOrdersForBook(id: number) {
  return repository.countOrdersForBook(id);
}

export async function deleteBook(id: number) {
  const deleted = await repository.deleteBook(id);
  revalidateTag("books", { expire: 0 });
  return deleted;
}
