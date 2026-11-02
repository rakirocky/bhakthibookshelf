import Container from "../ui/Container";
import SectionHeader from "../ui/SectionHeader";
import FeaturedBooksTabs, { FeaturedCard } from "./FeaturedBooksTabs";

import { getFeaturedBooksOrLatest } from "../../lib/services/book-service";
import { getLanguagePreference } from "../../lib/language";
import { getT } from "../../lib/i18n/server";
import { BOOK_LANGUAGES, BookLanguage, normalizeBookLanguage } from "../../lib/bookLanguage";

export default async function FeaturedBooks() {
  const t = await getT();
  const initialLanguage = normalizeBookLanguage(await getLanguagePreference());

  // One list per Language tab (each keeps its own "newest" fallback), so
  // switching tabs is instant and never changes the interface language.
  const lists = await Promise.all(
    BOOK_LANGUAGES.map((l) => getFeaturedBooksOrLatest(l))
  );
  const booksByLanguage = Object.fromEntries(
    BOOK_LANGUAGES.map((l, i) => [
      l,
      lists[i].map(
        (book): FeaturedCard => ({
          id: book.id,
          slug: book.slug,
          title: book.title,
          author: book.author,
          price: Number(book.discount_price ?? book.price),
          cover: book.cover_image,
          createdAt: book.created_at,
        })
      ),
    ])
  ) as Record<BookLanguage, FeaturedCard[]>;

  return (
    <section className="featured-books">
      <Container>
        <SectionHeader
          title={t("featured.title")}
          subtitle={t("featured.subtitle")}
        />

        <FeaturedBooksTabs
          booksByLanguage={booksByLanguage}
          initialLanguage={initialLanguage}
        />
      </Container>
    </section>
  );
}
