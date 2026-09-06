import { getAllBooks } from "@/app/lib/services/book-service";
import { getLanguagePreference } from "@/app/lib/language";

import BooksClient from "./BooksClient";

// Reads live data from the DB — see the same note in app/admin/layout.tsx.
export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const language = await getLanguagePreference();
  const books = await getAllBooks(language);

  return <BooksClient books={books} />;
}
