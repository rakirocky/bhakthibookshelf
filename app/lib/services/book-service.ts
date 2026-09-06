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

export async function createBook(book: {
  slug: string;
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
  return repository.createBook(book);
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
