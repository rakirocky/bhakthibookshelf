import { NextResponse } from "next/server";

import { getAllBooks } from "@/app/lib/services/book-service";
import { getLanguagePreference } from "@/app/lib/language";

// Minimal published-book list for the header's instant search (the
// catalogue is small, so the browser filters as you type) and the book
// page's "Recently viewed" strip. Follows the navbar language filter,
// like the Library. Public data only.
export async function GET() {
  const language = await getLanguagePreference();
  const books = await getAllBooks(language);

  return NextResponse.json(
    books.map((b: Record<string, unknown>) => ({
      slug: b.slug,
      title: b.title,
      subtitle: b.subtitle ?? null,
      author: b.author ?? null,
      description: typeof b.description === "string" ? b.description.slice(0, 300) : null,
      cover_image: b.cover_image ?? null,
      language: b.language ?? null,
      price: Number(b.discount_price ?? b.price),
    })),
    { headers: { "Cache-Control": "private, max-age=60" } }
  );
}
