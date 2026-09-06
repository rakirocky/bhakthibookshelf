import Button from "../ui/Button";
import Container from "../ui/Container";
import FeatureItem from "../ui/FeatureItem";
import HeroBookshelf from "./HeroBookshelf";

export default function Hero() {
  return (
    <section className="hero">
      <Container>
        <div className="hero-wrapper">
          <div className="hero-left">
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
              <FeatureItem text="Secure Payments" />
            </div>
          </div>

          <div className="hero-right">
            <HeroBookshelf />
          </div>
        </div>
      </Container>
    </section>
  );
}