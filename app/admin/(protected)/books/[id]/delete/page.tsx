import { notFound } from "next/navigation";

import DeleteBookButton from "@/app/components/admin/DeleteBookButton";
import {
  countOrdersForBook,
  getBookById,
} from "@/app/lib/services/book-service";

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

  const orders = await countOrdersForBook(book.id);

  return (
    <div
      style={{
        maxWidth: 600,
      }}
    >
      <h1 style={{ marginBottom: 16 }}>Delete Book</h1>

      <p
        style={{
          marginBottom: 16,
          color: "var(--color-text-strong)",
        }}
      >
        Are you sure you want to delete{" "}
        <strong>{book.title}</strong>{book.author ? ` by ${book.author}` : ""}? This
        cannot be undone.
      </p>

      {orders > 0 && (
        <p
          style={{
            marginBottom: 24,
            padding: 12,
            borderRadius: 8,
            background: "var(--color-danger-bg, #fdecea)",
            color: "var(--color-danger-text)",
          }}
        >
          This book is in {orders} {orders === 1 ? "order" : "orders"}. Those
          orders and invoices keep the book&apos;s title, but customers who
          bought it will no longer be able to read or download it. To only
          stop new sales, untick Published in Edit instead.
        </p>
      )}

      <DeleteBookButton bookId={book.id} />
    </div>
  );
}
