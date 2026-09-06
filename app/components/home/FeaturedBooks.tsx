import Container from "../ui/Container";
import SectionHeader from "../ui/SectionHeader";
import Button from "../ui/Button";
import BookCard from "../ui/BookCard";

import { getFeaturedBooks } from "../../lib/services/book-service";
import { getLanguagePreference } from "../../lib/language";

export default async function FeaturedBooks() {
  const language = await getLanguagePreference();
  const books = await getFeaturedBooks(language);

  return (
    <section className="featured-books">
      <Container>
        <SectionHeader
          title="Featured Books"
          subtitle="Begin your spiritual journey with our carefully selected devotional books."
        />

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

        <div className="view-all-books">
          <Button
            href="/books"
            text="View All Books"
          />
        </div>
      </Container>
    </section>
  );
}
