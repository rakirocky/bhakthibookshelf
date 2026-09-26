import { NextResponse } from "next/server";

import { getAllBooks } from "@/app/lib/services/book-service";
import { getLanguagePreference } from "@/app/lib/language";

// Minimal published-book list for the header's instant search (the
// catalogue is small, so the browser filters as you type) and the book
// page's "Recently viewed" strip. Follows the navbar language filter,
// like the Library. Public data only.
// ?all=1 ignores the language filter (the wishlist shows every saved book).
export async function GET(request: Request) {
  const all = new URL(request.url).searchParams.get("all") === "1";
  const books = await getAllBooks(all ? "all" : await getLanguagePreference());

  return NextResponse.json(
    books.map((b: Record<string, unknown>) => ({
      id: Number(b.id),
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
