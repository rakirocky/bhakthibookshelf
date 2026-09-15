"use client";

import { Book } from "@/app/lib/types/book";

import AddToCartButton from "../cart/AddToCartButton";
import OfflineSaveButton from "../books/OfflineSaveButton";
import { fileUrl } from "@/app/lib/upload/fileUrl";
import { useIsNativeApp } from "@/app/lib/offline/useNative";

type Props = {
  book: Book;
  hasAccess: boolean;
};

export default function BookActions({
  book,
  hasAccess,
}: Props) {
  const native = useIsNativeApp();

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
          {/* Inside the app, the protected offline reader is the only way
              to read a purchased book — a plain PDF link next to it would
              hand out an unwatermarked, unencrypted copy and defeat the
              whole point of the offline-downloads protection. The website
              (no in-app reader available there) keeps the plain download. */}
          {!native && (
            <a
              href={`/api/customer/download/${book.id}`}
              className="btn btn-primary"
              style={{ textDecoration: "none" }}
            >
              ✓ Download Full Book
            </a>
          )}

          <OfflineSaveButton bookId={book.id} />
        </>
      ) : (
        <AddToCartButton
          book={book}
        />
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
