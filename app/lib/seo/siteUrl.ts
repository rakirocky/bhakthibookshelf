// Absolute origin used for canonical URLs, sitemap entries and JSON-LD.
// Prod sets NEXT_PUBLIC_SITE_URL=https://bhakthibookshelf.in in .env.local.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010"
).replace(/\/+$/, "");

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
