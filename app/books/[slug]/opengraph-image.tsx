import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import sharp from "sharp";

import { getBookBySlug } from "@/app/lib/services/book-service";
import { readStorageFile } from "@/app/lib/upload/readStorageFile";

// The link-preview card WhatsApp/Facebook/X show when a book URL is
// shared: cover + title + author on parchment, 1200x630 (the size they
// all render well). Overrides the portrait cover generateMetadata used
// to send. Font: Marcellus (OFL, /assets/fonts).
export const alt = "A devotional book on Bhakthi Bookshelf";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function coverDataUri(stored?: string | null) {
  if (!stored) return null;
  try {
    // Satori can't read WebP, so normalise every cover to PNG.
    const png = await sharp(await readStorageFile(stored))
      .resize({ height: 520, withoutEnlargement: false })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  const [marcellus, cover] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Marcellus-Regular.ttf")),
    coverDataUri(book?.cover_image),
  ]);

  // The card renderer (Satori) can't shape Kannada conjuncts — "ಶ್ರೀ"
  // came out as "ಶರೀ" — so non-Latin titles/authors aren't drawn here.
  // WhatsApp etc. still show the real title as text (og:title) under
  // the card, rendered correctly by the phone.
  const latin = (s: string) => /^[\u0000-\u024F\u2000-\u206F\u20B9]*$/.test(s);
  const rawTitle = book?.title ?? "Bhakthi Bookshelf";
  const rawAuthor = book?.author ?? "A home for devotional reading";
  const title = latin(rawTitle)
    ? rawTitle
    : book?.language?.toLowerCase() === "kannada"
      ? "A Kannada devotional book"
      : "A devotional book";
  const author = latin(rawAuthor) ? rawAuthor : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 22,
          background: "linear-gradient(180deg, #fffaf0 0%, #fbe8c4 100%)",
          fontFamily: "Marcellus",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 56,
            padding: "0 64px",
            border: "3px solid #d97706",
            borderRadius: 18,
            boxShadow: "inset 0 0 0 8px #fffaf0, inset 0 0 0 10px rgba(217,119,6,0.45)",
          }}
        >
          {cover && (
            <img
              src={cover}
              alt=""
              height={470}
              style={{
                borderRadius: 10,
                boxShadow: "0 24px 50px rgba(124,45,18,0.35)",
              }}
            />
          )}

          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 24,
                letterSpacing: 6,
                color: "#b45309",
                marginBottom: 22,
              }}
            >
              BHAKTHI BOOKSHELF
            </div>

            <div
              style={{
                fontSize: title.length > 28 ? 58 : 72,
                lineHeight: 1.1,
                color: "#7c2d12",
                marginBottom: 20,
              }}
            >
              {title}
            </div>

            <div style={{ fontSize: 32, color: "#6b4a2f", marginBottom: 40 }}>
              {author || " "}
            </div>

            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "12px 26px",
                borderRadius: 999,
                background: "#7c2d12",
                color: "#fde68a",
                fontSize: 26,
              }}
            >
              Read on bhakthibookshelf.in
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Marcellus", data: marcellus, style: "normal", weight: 400 },
      ],
    }
  );
}
