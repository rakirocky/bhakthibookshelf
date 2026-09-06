import BookCard from "../ui/BookCard";
import type { Book } from "../../lib/types/book";

type Props = {
  books: Book[];
};

export default function RelatedBooks({
  books,
}: Props) {
  if (books.length === 0) {
    return null;
  }

  return (
    <section className="related-books">

      <h2>Related Books</h2>

      <div className="books-grid">

        {books.map((book) => (
          <BookCard
            key={book.id}
            slug={book.slug}
            title={book.title}
            author={book.author}
            price={Number(
              book.discount_price ?? book.price
            )}
            cover={book.cover_image}
          />
        ))}

      </div>

    </section>
  );
}
