"use client";

import { useRouter } from "next/navigation";

import { Book } from "@/app/lib/types/book";

import AddToCartButton from "../cart/AddToCartButton";
import OfflineSaveButton from "../books/OfflineSaveButton";
import PurchaseOnWebNotice from "../native/PurchaseOnWebNotice";
import { fileUrl } from "@/app/lib/upload/fileUrl";
import { useCart } from "@/app/hooks/useCart";
import { useIsNativeApp } from "@/app/lib/offline/useNative";

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
  const native = useIsNativeApp();

  // "Download Full Book — ₹x" is a buy-now shortcut for a book you don't
  // own yet: adds to cart and goes straight to checkout, sitting alongside
  // the regular "Add To Cart" for anyone who wants to keep browsing first.
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
        <OfflineSaveButton bookId={book.id} />
      ) : native ? (
        <PurchaseOnWebNotice />
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
