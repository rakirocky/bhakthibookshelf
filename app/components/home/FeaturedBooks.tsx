import Container from "../ui/Container";
import SectionHeader from "../ui/SectionHeader";
import Button from "../ui/Button";
import BookCard from "../ui/BookCard";
import LanguageComingSoon from "./LanguageComingSoon";

import { getFeaturedBooksOrLatest } from "../../lib/services/book-service";
import { getLanguagePreference } from "../../lib/language";
import { getT } from "../../lib/i18n/server";

export default async function FeaturedBooks() {
  const language = await getLanguagePreference();
  const t = await getT();
  const books = await getFeaturedBooksOrLatest(language);

  return (
    <section className="featured-books">
      <Container>
        <SectionHeader
          title={t("featured.title")}
          subtitle={t("featured.subtitle")}
        />

        {books.length === 0 && (
          <LanguageComingSoon language={language} compact />
        )}

        <div className="books-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              slug={book.slug}
              title={book.title}
              author={book.author}
              price={Number(book.discount_price ?? book.price)}
              cover={book.cover_image}
              createdAt={book.created_at}
            />
          ))}
        </div>

        <div className="view-all-books">
          <Button
            href="/books"
            text={t("featured.viewAll")}
          />
        </div>
      </Container>
    </section>
  );
}
