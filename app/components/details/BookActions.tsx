import { Book } from "@/app/lib/types/book";

import AddToCartButton from "../cart/AddToCartButton";
import OfflineSaveButton from "../books/OfflineSaveButton";
import { fileUrl } from "@/app/lib/upload/fileUrl";

type Props = {
  book: Book;
  hasAccess: boolean;
};

export default function BookActions({
  book,
  hasAccess,
}: Props) {
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
