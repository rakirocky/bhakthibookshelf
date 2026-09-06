import "server-only";

import * as repository from "../repositories/bookRepository";

export async function getAllBooks(language?: string) {
  return repository.findAllBooks(language);
}

export async function getFeaturedBooks(language?: string) {
  return repository.findFeaturedBooks(language);
}

export async function getBookBySlug(slug: string) {
  return repository.findBookBySlug(slug);
}

export async function getRelatedBooks(
  currentSlug: string,
  limit = 4,
  language?: string
) {
  const books = await repository.findAllBooks(language);

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

  return repository.createBook({ ...book, slug });
}
export async function getBookById(id: number) {
  return repository.getBookById(id);
}

export async function updateBook(
  id: number,
  book: any
) {
  return repository.updateBook(id, book);
}

export async function deleteBook(id: number) {
  return repository.deleteBook(id);
}
