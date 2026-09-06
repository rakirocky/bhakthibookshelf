import "server-only";

import { db } from "../db/db";

export async function findAllBooks(language?: string) {
  const params: string[] = [];
  let whereClause = "WHERE published=true";

  if (language && language !== "all") {
    params.push(language);
    whereClause += ` AND language=$${params.length}`;
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
  const params: string[] = [];
  let whereClause = "WHERE featured=true AND published=true";

  if (language && language !== "all") {
    params.push(language);
    whereClause += ` AND language=$${params.length}`;
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
      language
    )

    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
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
      updated_at=NOW()
    WHERE id=$12
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
