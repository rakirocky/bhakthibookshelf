import BookCard from "../ui/BookCard";
import type { Book } from "../../lib/types/book";
import { getT } from "../../lib/i18n/server";

type Props = {
  books: Book[];
};

export default async function RelatedBooks({
  books,
}: Props) {
  const t = await getT();

  if (books.length === 0) {
    return null;
  }

  return (
    <section className="related-books">

      <h2>{t("book.related")}</h2>

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
            createdAt={book.created_at}
          />
        ))}

      </div>

    </section>
  );
}
