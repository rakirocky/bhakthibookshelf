import Image from "next/image";

import Button from "../ui/Button";
import Container from "../ui/Container";
import FeatureItem from "../ui/FeatureItem";
import HeroBookshelf from "./HeroBookshelf";
import LanguageComingSoon from "./LanguageComingSoon";

import { getAllBooks } from "../../lib/services/book-service";
import { getLanguagePreference } from "../../lib/language";
import { getT } from "../../lib/i18n/server";

// How many of the newest covers feed the slider — getAllBooks() is already
// ordered by created_at DESC, so slicing here just means the latest admin
// upload is the first thing visitors see.
const HERO_BOOK_LIMIT = 10;

export default async function Hero() {
  const t = await getT();
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
            {/* same Om as the About page banners (public/images/om.jpg) */}
            <div className="hero-om">
              <Image src="/images/om.jpg" alt="" width={144} height={144} priority />
            </div>

            <p className="hero-tag">
              🪔 {t("hero.tag")}
            </p>

            <h1>
              {t("hero.title1")} <span>{t("hero.title2")}</span>
            </h1>

            <p className="hero-description">
              {t("hero.description")}
            </p>
          </div>

          <div className="hero-right">
            {heroBooks.length > 0 ? (
              // key: remount on a language switch so the slider starts
              // from the first cover of the new list, not a stale index.
              <HeroBookshelf key={language} books={heroBooks} />
            ) : (
              <LanguageComingSoon language={language} />
            )}
          </div>

          <div className="hero-left">
            <div className="hero-buttons">
              <Button
                href="/books"
                text={t("hero.explore")}
              />

              <Button
                href="/books"
                text={t("hero.browse")}
              />
            </div>

            <div className="hero-features">
              <FeatureItem text={t("hero.feature.curated")} />
              <FeatureItem text={t("hero.feature.instant")} />
              <FeatureItem text={t("hero.feature.secure")} webOnly />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
