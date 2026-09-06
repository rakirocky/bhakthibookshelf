import Link from "next/link";

import { getAdminBooks } from "@/app/lib/services/book-service";

export default async function AdminBooksPage() {
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
          <tr
            style={{
              background: "var(--color-bg-subtle)",
            }}
          >
            <th align="left" style={{ padding: 14 }}>
              Title
            </th>

            <th align="left">Author</th>

            <th align="center">Price</th>

            <th align="center">Featured</th>

            <th align="center">Published</th>

            <th align="center">Action</th>
          </tr>
        </thead>

        <tbody>
          {books.map((book: any) => (
            <tr
              key={book.id}
              style={{
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <td style={{ padding: 14 }}>
                {book.title}
              </td>

              <td>{book.author}</td>

              <td align="center">
                ₹{book.price}
              </td>

              <td align="center">
                {book.featured ? "Yes" : "No"}
              </td>

              <td align="center">
                {book.published ? "Yes" : "No"}
              </td>

              <td align="center">
                <Link
                  href={`/admin/books/${book.id}`}
                >
                  Edit
                </Link>

                {" | "}

                <Link
                  href={`/admin/books/${book.id}/delete`}
                >
                  Delete
                </Link>
              </td>
            </tr>
          ))}

          {books.length === 0 && (
            <tr>
              <td
                colSpan={6}
                align="center"
                style={{
                  padding: 30,
                }}
              >
                No books found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      </div>
    </div>
  );
}
