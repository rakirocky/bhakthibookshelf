import Link from "next/link";

import AdminBooksTable from "@/app/components/admin/AdminBooksTable";
import { getAdminBooks } from "@/app/lib/services/book-service";

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const books = await getAdminBooks();

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <div>
          <h1>Books</h1>

          <p
            style={{
              color: "var(--color-text-secondary)",
            }}
          >
            Total Books : {books.length}
          </p>
        </div>

        <Link
          href="/admin/books/add"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-white)",
            textDecoration: "none",
            padding: "10px 18px",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          + Add Book
        </Link>
      </div>

      <AdminBooksTable
        // remount when the header search changes ?q= on this page
        key={q ?? ""}
        books={books.map((b: any) => ({
          id: Number(b.id),
          slug: b.slug ?? "",
          title: b.title ?? "",
          author: b.author ?? "",
          language: b.language ?? "",
          category: b.category ?? "",
          price: String(b.price ?? ""),
          featured: Boolean(b.featured),
          published: Boolean(b.published),
        }))}
        initialQuery={q ?? ""}
      />
    </div>
  );
}
