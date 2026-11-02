import { getAllBooks } from "@/app/lib/services/book-service";
import { getLanguagePreference } from "@/app/lib/language";
import { normalizeCategory } from "@/app/lib/categories";
import { normalizeBookLanguage } from "@/app/lib/bookLanguage";

import BooksClient from "./BooksClient";
import { pageMetadata } from "@/app/lib/seo/pageMetadata";

export const metadata = pageMetadata(
  "Library — Devotional Books & Scriptures",
  "Browse the Bhakthi Bookshelf library: Bhagavad Gita, Ramayana, stotras, puranas and devotional books in English and Kannada, to read online or offline.",
  "/books"
);

// Reads live data from the DB — see the same note in app/admin/layout.tsx.
export const dynamic = "force-dynamic";

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; lang?: string }>;
}) {
  const { category, q, lang } = await searchParams;
  // Every published book is sent; the Language chips filter on the client
  // (starting from ?lang= or the navbar choice) so a reader can switch to
  // Kannada books without the interface changing language.
  const books = await getAllBooks();
  const initialLanguage = normalizeBookLanguage(lang ?? (await getLanguagePreference()));

  return (
    <BooksClient
      // remount when arriving from a different category/search link
      key={`${category ?? ""}|${q ?? ""}|${initialLanguage}`}
      books={books}
      initialCategory={normalizeCategory(category)}
      initialQuery={(q ?? "").slice(0, 100)}
      initialLanguage={initialLanguage}
    />
  );
}
