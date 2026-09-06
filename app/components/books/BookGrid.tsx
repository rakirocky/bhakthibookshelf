import BookCard from "../ui/BookCard";

type Props = {
  books: any[];
};

export default function BookGrid({
  books,
}: Props) {
  return (
    <div className="books-grid">
      {books.map((book) => (
        <BookCard
          key={book.id}
          slug={book.slug}
          title={book.title}
          author={book.author}
          price={Number(book.discount_price ?? book.price)}
          cover={book.cover_image}
        />
      ))}
    </div>
  );
}
