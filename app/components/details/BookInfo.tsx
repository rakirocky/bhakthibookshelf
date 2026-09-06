import { Book } from "../../lib/types/book";

type Props = {
  book: Book;
};

export default function BookInfo({
  book,
}: Props) {

  const sellingPrice =
    Number(book.discount_price ?? book.price);

  return (
    <section className="book-info">

      <h1>{book.title}</h1>

      {book.subtitle && (
        <h3>{book.subtitle}</h3>
      )}

      <div className="book-meta">

        <p>
          <strong>Author</strong><br />
          {book.author}
        </p>

        <p>
          <strong>Publisher</strong><br />
          {book.publisher || "-"}
        </p>

        <p>
          <strong>Language</strong><br />
          {book.language}
        </p>

        <p>
          <strong>Pages</strong><br />
          {book.pages || "-"}
        </p>

      </div>

      <div className="book-price">

        {book.discount_price && (
          <span
            style={{
              textDecoration: "line-through",
              marginRight: 12,
              opacity: .6
            }}
          >
            ₹{book.price}
          </span>
        )}

        <span
          style={{
            fontSize: "2rem",
            fontWeight: 700
          }}
        >
          ₹{sellingPrice}
        </span>

      </div>

    </section>
  );
}
