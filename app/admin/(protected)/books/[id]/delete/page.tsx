import { notFound } from "next/navigation";

import DeleteBookButton from "@/app/components/admin/DeleteBookButton";
import { getBookById } from "@/app/lib/services/book-service";

export default async function DeleteBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const book = await getBookById(Number(id));

  if (!book) {
    notFound();
  }

  return (
    <div
      style={{
        maxWidth: 600,
      }}
    >
      <h1 style={{ marginBottom: 16 }}>Delete Book</h1>

      <p
        style={{
          marginBottom: 24,
          color: "var(--color-text-strong)",
        }}
      >
        Are you sure you want to delete{" "}
        <strong>{book.title}</strong> by {book.author}? This
        cannot be undone.
      </p>

      <DeleteBookButton bookId={book.id} />
    </div>
  );
}
