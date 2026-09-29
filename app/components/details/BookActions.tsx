"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Book } from "@/app/lib/types/book";

import AddToCartButton from "../cart/AddToCartButton";
import OfflineSaveButton from "../books/OfflineSaveButton";
import LookInside from "./LookInside";
import { fileUrl } from "@/app/lib/upload/fileUrl";
import { useCart } from "@/app/hooks/useCart";
import { useIsReadOnlyApp } from "@/app/lib/offline/appMode";
import { useT } from "@/app/lib/i18n/I18nProvider";

type Props = {
  book: Book;
  hasAccess: boolean;
  signedIn: boolean;
};

export default function BookActions({
  book,
  hasAccess,
  signedIn,
}: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const readOnlyApp = useIsReadOnlyApp();
  const { t } = useT();

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
      ) : readOnlyApp && !signedIn ? (
        // Signed out (e.g. the one-device rule ended this session): the
        // book may well be owned, so ask for a sign-in, not "not owned".
        <>
          <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
            {t("book.signInToRead")}
          </p>
          <Link
            href={`/account/login?from=${encodeURIComponent(`/books/${book.slug}`)}`}
            className="btn btn-primary"
          >
            {t("auth.signIn")}
          </Link>
        </>
      ) : readOnlyApp ? (
        // Read-only app: no buy button, price or "buy on the web" pointer
        // (Play anti-steering policy) — just state it isn't owned.
        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
          {t("book.notInLibrary")}
        </p>
      ) : (
        <span data-web-only style={{ display: "contents" }}>
          <AddToCartButton book={book} />

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleBuyAndCheckout}
          >
            {t("book.buyNow", { price: String(book.discount_price ?? book.price) })}
          </button>
        </span>
      )}

      {book.sample_pdf && (
        <LookInside title={book.title} sampleUrl={fileUrl(book.sample_pdf)} />
      )}
    </div>
  );
}
