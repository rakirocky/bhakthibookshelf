import Button from "../ui/Button";
import Container from "../ui/Container";
import FeatureItem from "../ui/FeatureItem";
import HeroBookshelf from "./HeroBookshelf";

import { getAllBooks } from "../../lib/services/book-service";
import { getLanguagePreference } from "../../lib/language";

// How many of the newest covers feed the slider — getAllBooks() is already
// ordered by created_at DESC, so slicing here just means the latest admin
// upload is the first thing visitors see.
const HERO_BOOK_LIMIT = 10;

export default async function Hero() {
  const language = await getLanguagePreference();
  const allBooks = await getAllBooks(language);

  const heroBooks = allBooks.slice(0, HERO_BOOK_LIMIT).map((book) => ({
    id: book.id,
    slug: book.slug,
    title: book.title,
    cover_image: book.cover_image,
  }));

  return (
    <section className="hero">
      <Container>
        <div className="hero-wrapper">
          <div className="hero-intro">
            <p className="hero-tag">
              🪔 Trusted Digital Spiritual Library
            </p>

            <h1>
              Bhakthi <span>Bookshelf</span>
            </h1>

            <p className="hero-description">
              Discover timeless Hindu scriptures, devotional books,
              epics, prayers and spiritual wisdom. Build your own
              digital library and carry divine knowledge wherever
              you go.
            </p>
          </div>

          <div className="hero-right">
            <HeroBookshelf books={heroBooks} />
          </div>

          <div className="hero-left">
            <div className="hero-buttons">
              <Button
                href="/books"
                text="Explore Library"
              />

              <Button
                href="/books"
                text="Browse Collection"
              />
            </div>

            <div className="hero-features">
              <FeatureItem text="Curated Collection" />
              <FeatureItem text="Instant Downloads" />
              <FeatureItem text="Secure Payments" webOnly />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
