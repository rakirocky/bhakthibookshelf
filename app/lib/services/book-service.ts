import "server-only";

import { revalidateTag, unstable_cache } from "next/cache";

import * as repository from "../repositories/bookRepository";

// The catalogue is read far more often than it's written, so these wrap
// the DB reads in Next's data cache — still re-validated instantly on
// any admin write via revalidateTag("books") below, and on a 5-minute
// ceiling otherwise. This does NOT change page-level rendering (pages
// keep whatever `dynamic`/cookie-driven behavior they already have) —
// it only removes the Postgres round-trip from the hot path.
export const getAllBooks = unstable_cache(
  async (language?: string) => repository.findAllBooks(language),
  ["books", "all"],
  { tags: ["books"], revalidate: 300 }
);

export const getFeaturedBooks = unstable_cache(
  async (language?: string) => repository.findFeaturedBooks(language),
  ["books", "featured"],
  { tags: ["books"], revalidate: 300 }
);

export const getBookBySlug = unstable_cache(
  async (slug: string) => repository.findBookBySlug(slug),
  ["books", "by-slug"],
  { tags: ["books"], revalidate: 300 }
);

export async function getRelatedBooks(
  currentSlug: string,
  limit = 4,
  language?: string
) {
  const books = await getAllBooks(language);

  return books
    .filter((book) => book.slug !== currentSlug)
    .slice(0, limit);
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
}) {
  // The admin form no longer asks for a slug at all — generated here,
  // from the title, guaranteed unique. Whatever the client sends for
  // `slug` (nothing, now) is ignored on purpose for new books.
  const slug = await generateUniqueSlug(book.title);

  const created = await repository.createBook({ ...book, slug });
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
  const updated = await repository.updateBook(id, book);
  revalidateTag("books", { expire: 0 });
  return updated;
}

export async function deleteBook(id: number) {
  const deleted = await repository.deleteBook(id);
  revalidateTag("books", { expire: 0 });
  return deleted;
}
