"use client";

import { useRouter } from "next/navigation";

import { Book } from "@/app/lib/types/book";

import AddToCartButton from "../cart/AddToCartButton";
import OfflineSaveButton from "../books/OfflineSaveButton";
import { fileUrl } from "@/app/lib/upload/fileUrl";
import { useCart } from "@/app/hooks/useCart";

type Props = {
  book: Book;
  hasAccess: boolean;
};

export default function BookActions({
  book,
  hasAccess,
}: Props) {
  const router = useRouter();
  const { addItem } = useCart();

  // "Download Full Book" always shows. For a book you already own it's a
  // real download link; for one you don't, it's a "buy now" shortcut —
  // adds to cart and goes straight to checkout — sitting alongside the
  // regular "Add To Cart" for anyone who wants to keep browsing first.
  function handleBuyAndCheckout() {
    addItem({
      id: book.id,
      slug: book.slug,
      title: book.title,
      author: book.author,
      cover: book.cover_image,
      price: Number(book.discount_price ?? book.price),
    });

    router.push("/checkout");
  }

  return (
    <div
      className="book-actions"
      style={{
        display: "flex",
        gap: 16,
        marginTop: 30,
        flexWrap: "wrap",
      }}
    >
      {hasAccess ? (
        <>
          <a
            href={`/api/customer/download/${book.id}`}
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            ✓ Download Full Book
          </a>

          <OfflineSaveButton bookId={book.id} />
        </>
      ) : (
        <>
          <AddToCartButton book={book} />

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleBuyAndCheckout}
          >
            Download Full Book — ₹
            {book.discount_price ?? book.price}
          </button>
        </>
      )}

      {book.sample_pdf && (
        <a
          href={fileUrl(book.sample_pdf)}
          target="_blank"
          rel="noopener noreferrer"
          className="sample-button"
        >
          Download Sample PDF
        </a>
      )}
    </div>
  );
}
