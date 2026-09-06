import { Book } from "../../lib/types/book";

type Props = {
  book: Book;
};

export default function BookDescription({
  book,
}: Props) {
  return (
    <section className="book-description">

      <h2>Description</h2>

      <p>
        {book.description ||
          "Description will be updated soon."}
      </p>

    </section>
  );
}
