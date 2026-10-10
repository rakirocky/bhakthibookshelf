"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CATEGORY_LABEL, normalizeCategory } from "@/app/lib/categories";
import { translate } from "@/app/lib/i18n/dictionary";

export type AdminBookRow = {
  id: number;
  slug: string;
  title: string;
  author: string;
  language: string;
  category: string;
  price: string;
  featured: boolean;
  published: boolean;
};

// Case-, space- and punctuation-insensitive, so "panchamukhi hanuman",
// "Panchamuki-Hauman" and "PANCHAMUKI" all find the same book.
function norm(s: string) {
  return s.toLowerCase().replace(/[\s\-_.,:;'"()]+/g, " ").trim();
}

function categoryName(category: string) {
  const c = normalizeCategory(category);
  return c ? translate("en", CATEGORY_LABEL[c]) : "";
}

/** Admin → Books list with a live search (title, slug, author, language, category). */
export default function AdminBooksTable({
  books,
  initialQuery,
}: {
  books: AdminBookRow[];
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);

  const shown = useMemo(() => {
    const words = norm(query).split(" ").filter(Boolean);
    if (words.length === 0) return books;
    return books.filter((b) => {
      const hay = norm(
        [b.title, b.slug, b.author, b.language, categoryName(b.category)].join(" ")
      );
      return words.every((w) => hay.includes(w));
    });
  }, [books, query]);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books by title, author, language or category"
          aria-label="Search books"
          autoFocus={Boolean(initialQuery)}
          style={{
            flex: "1 1 320px",
            maxWidth: 520,
            padding: "10px 12px",
            border: "1px solid var(--color-border-strong)",
            borderRadius: 8,
            fontSize: 15,
          }}
        />
        {query && (
          <span style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
            Showing {shown.length} of {books.length}
          </span>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "var(--color-white)",
            minWidth: 700,
          }}
        >
          <thead>
            <tr style={{ background: "var(--color-bg-subtle)" }}>
              <th align="left" style={{ padding: 14 }}>
                Title
              </th>
              <th align="center">Price</th>
              <th align="center">Featured</th>
              <th align="center">Published</th>
              <th align="center">Action</th>
            </tr>
          </thead>

          <tbody>
            {shown.map((book) => (
              <tr
                key={book.id}
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <td style={{ padding: 14 }}>{book.title}</td>
                <td align="center">₹{book.price}</td>
                <td align="center">{book.featured ? "Yes" : "No"}</td>
                <td align="center">{book.published ? "Yes" : "No"}</td>
                <td align="center">
                  <Link href={`/admin/books/${book.id}`}>Edit</Link>
                  {" | "}
                  <Link href={`/admin/books/${book.id}/delete`}>Delete</Link>
                </td>
              </tr>
            ))}

            {shown.length === 0 && (
              <tr>
                <td colSpan={5} align="center" style={{ padding: 30 }}>
                  {books.length === 0
                    ? "No books found."
                    : `No books match “${query.trim()}”.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
