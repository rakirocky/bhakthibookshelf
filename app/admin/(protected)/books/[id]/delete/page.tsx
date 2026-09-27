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
      <h1 style={{ marginBottom: 16 }}>
        {orders > 0 ? "Hide Book" : "Delete Book"}
      </h1>

      {orders > 0 ? (
        <p
          style={{
            marginBottom: 24,
            color: "var(--color-text-strong)",
          }}
        >
          <strong>{book.title}</strong> appears in {orders}{" "}
          {orders === 1 ? "order" : "orders"}, so it can&apos;t be deleted —
          order history and invoices need it. Instead it will be hidden
          from the store (unpublished): customers can no longer find or buy
          it, and buyers keep the copy already on their device. You can
          publish it again later from Edit.
        </p>
      ) : (
        <p
          style={{
            marginBottom: 24,
            color: "var(--color-text-strong)",
          }}
        >
          Are you sure you want to delete{" "}
          <strong>{book.title}</strong>{book.author ? ` by ${book.author}` : ""}? This
          cannot be undone.
        </p>
      )}

      <DeleteBookButton bookId={book.id} hideOnly={orders > 0} />
    </div>
  );
}
