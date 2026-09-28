import { NextResponse } from "next/server";

import { getPurchasablePrices } from "@/app/lib/repositories/bookRepository";

// Which of the given book ids can still be bought, at today's price.
// The cart lives in the visitor's browser, so a book the admin deleted
// or unpublished can still sit in it — CartContext calls this to drop
// such books (and tell the visitor) before checkout, and to refresh
// prices. Public data only.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { ids?: unknown };
    const ids = Array.isArray(body.ids)
      ? [...new Set(body.ids.map(Number))]
          .filter((id) => Number.isInteger(id) && id > 0)
          .slice(0, 100)
      : [];

    const books = ids.length > 0 ? await getPurchasablePrices(ids) : [];

    return NextResponse.json(
      // Postgres returns the id as a string — send numbers
      { books: books.map((b) => ({ ...b, id: Number(b.id) })) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[books/availability]", error);
    return NextResponse.json({ books: null }, { status: 500 });
  }
}
