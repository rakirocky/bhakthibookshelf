import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { WishlistRepository } from "@/app/lib/repositories/wishlistRepository";

/**
 * The logged-in customer's wishlist, as book slugs.
 *
 *   GET                       → { loggedIn, slugs }  (guests: loggedIn false —
 *                               the browser keeps their list in localStorage;
 *                               public in proxy.ts, so every handler checks
 *                               the session itself)
 *   POST   { slugs: [...] }   → add (also merges a guest list after login)
 *   DELETE { slug }           → remove
 *
 * POST and DELETE answer with the full, current list.
 */

const MAX_SLUGS = 200;

function cleanSlugs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter((s): s is string => typeof s === "string" && s.length > 0 && s.length <= 255)
    ),
  ].slice(0, MAX_SLUGS);
}

const notLoggedIn = () =>
  NextResponse.json({ success: false, loggedIn: false, message: "Not authenticated." }, { status: 401 });

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ success: true, loggedIn: false, slugs: [] });

  const slugs = await WishlistRepository.getSlugs(session.customerId);
  return NextResponse.json({ success: true, loggedIn: true, slugs });
}

export async function POST(request: Request) {
  const session = await getCustomerSession();
  if (!session) return notLoggedIn();

  const body = await request.json().catch(() => ({}));
  await WishlistRepository.addSlugs(session.customerId, cleanSlugs(body.slugs));

  const slugs = await WishlistRepository.getSlugs(session.customerId);
  return NextResponse.json({ success: true, loggedIn: true, slugs });
}

export async function DELETE(request: Request) {
  const session = await getCustomerSession();
  if (!session) return notLoggedIn();

  const body = await request.json().catch(() => ({}));
  if (typeof body.slug === "string" && body.slug) {
    await WishlistRepository.removeSlug(session.customerId, body.slug);
  }

  const slugs = await WishlistRepository.getSlugs(session.customerId);
  return NextResponse.json({ success: true, loggedIn: true, slugs });
}
