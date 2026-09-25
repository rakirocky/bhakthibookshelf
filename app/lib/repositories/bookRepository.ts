import "server-only";

import { db } from "../db/db";

// Match a language however it was typed ("English", "en", "ENGLISH ")
// so a stray value can't silently drop a book from the language filter
// (migration 026 normalized the existing rows).
function languageAliases(language: string): string[] {
  const l = language.trim().toLowerCase();
  if (l === "english" || l === "en") return ["english", "en", "eng"];
  if (l === "kannada" || l === "kn") return ["kannada", "kn", "kan"];
  return [l];
}

export async function findAllBooks(language?: string) {
  const params: string[][] = [];
  let whereClause = "WHERE published=true";

  if (language && language !== "all") {
    params.push(languageAliases(language));
    whereClause += " AND lower(trim(language)) = ANY($1::text[])";
  }

  const { rows } = await db.query(
    `
    SELECT *
    FROM books
    ${whereClause}
    ORDER BY created_at DESC;
    `,
    params
  );

  return rows;
}

export async function findFeaturedBooks(language?: string) {
  const params: string[][] = [];
  let whereClause = "WHERE featured=true AND published=true";

  if (language && language !== "all") {
    params.push(languageAliases(language));
    whereClause += " AND lower(trim(language)) = ANY($1::text[])";
  }

  const { rows } = await db.query(
    `
    SELECT *
    FROM books
    ${whereClause}
    ORDER BY title;
    `,
    params
  );

  return rows;
}

export async function findBookBySlug(slug: string) {
  const { rows } = await db.query(
    `
    SELECT *
    FROM books
    WHERE slug=$1
    LIMIT 1;
    `,
    [slug]
  );

  return rows[0] ?? null;
}

export async function getBookCount() {
  const { rows } = await db.query(`
    SELECT COUNT(*)::int AS total
    FROM books
    WHERE published=true;
  `);

  return rows[0].total;
}

// Same as getBookCount(), but excludes the "TEST DEMO - ..." rows added for
// the coverflow slider demo — those aren't real catalog and shouldn't
// inflate the public-facing stats count. Safe to simplify back to
// getBookCount() once those rows are deleted.
export async function getPublicBookCount() {
  const { rows } = await db.query(`
    SELECT COUNT(*)::int AS total
    FROM books
    WHERE published=true
      AND title NOT LIKE 'TEST DEMO - %';
  `);

  return rows[0].total;
}

export async function getLatestBooks(limit = 5) {
  const { rows } = await db.query(
    `
    SELECT
      id,
      slug,
      title,
      author,
      price,
      cover_image,
      created_at
    FROM books
    WHERE published=true
    ORDER BY created_at DESC
    LIMIT $1;
    `,
    [limit]
  );

  return rows;
}

/* ---------- ADMIN ---------- */

export async function getAdminBooks() {
  const { rows } = await db.query(`
      SELECT
        id,
        title,
        author,
        price,
        featured,
        published,
        created_at
      FROM books
      ORDER BY id DESC;
  `);

  return rows;
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
  category: string | null;
}) {
  const { rows } = await db.query(
    `
    INSERT INTO books
    (
      slug,
      title,
      author,
      description,
      price,
      cover_image,
      sample_pdf,
      full_pdf,
      featured,
      published,
      language,
      category
    )

    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
    )

    RETURNING *
    `,
    [
      book.slug,
      book.title,
      book.author,
      book.description,
      book.price,
      book.cover_image,
      book.sample_pdf,
      book.full_pdf,
      book.featured,
      book.published,
      book.language,
      book.category,
    ]
  );

  return rows[0];
}

export async function getBookById(id: number) {
  const { rows } = await db.query(
    `
    SELECT *
    FROM books
    WHERE id = $1
    LIMIT 1;
    `,
    [id]
  );

  return rows[0] ?? null;
}

export async function updateBook(
  id: number,
  book: {
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
    category: string | null;
  }
) {
  const { rows } = await db.query(
    `
    UPDATE books
    SET
      slug=$1,
      title=$2,
      author=$3,
      description=$4,
      price=$5,
      cover_image=$6,
      sample_pdf=$7,
      full_pdf=$8,
      featured=$9,
      published=$10,
      language=$11,
      category=$12,
      updated_at=NOW()
    WHERE id=$13
    RETURNING *;
    `,
    [
      book.slug,
      book.title,
      book.author,
      book.description,
      book.price,
      book.cover_image,
      book.sample_pdf,
      book.full_pdf,
      book.featured,
      book.published,
      book.language,
      book.category,
      id,
    ]
  );

  return rows[0];
}

export async function deleteBook(id: number) {
  await db.query(
    `
    DELETE FROM books
    WHERE id=$1;
    `,
    [id]
  );
}

// The price actually charged for each published book — orders must
// be priced from this, never from what the browser sends.
export async function getPurchasablePrices(ids: number[]) {
  const { rows } = await db.query(
    `
    SELECT id, title, COALESCE(discount_price, price)::numeric AS price
    FROM books
    WHERE published = true AND id = ANY($1::int[]);
    `,
    [ids]
  );

  return rows.map((r: { id: number; title: string; price: string }) => ({
    id: r.id,
    title: r.title,
    price: Number(r.price),
  }));
}
