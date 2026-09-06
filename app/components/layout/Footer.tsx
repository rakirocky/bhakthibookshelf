import Link from "next/link";
import Container from "../ui/Container";

export default function Footer() {
  return (
    <footer className="footer">
      <Container>

        <div className="footer-top">

          <div className="footer-brand">
            <h2>Bhakthi Bookshelf</h2>

            <p className="footer-tagline">
              A Home for Devotional Reading
            </p>

            <p className="footer-description">
              Discover timeless Hindu scriptures, devotional books,
              epics, prayers and spiritual wisdom in one trusted
              digital library.
            </p>
          </div>

          <div className="footer-links">
            <h3>Quick Links</h3>

            <Link href="/">Home</Link>

            <Link href="/books">Books</Link>

            <Link href="/about">About</Link>

            <Link href="/contact">Contact</Link>
          </div>

          <div className="footer-links">
            <h3>Categories</h3>

            <Link href="/books">Scriptures</Link>

            <Link href="/books">Epics</Link>

            <Link href="/books">Prayers</Link>

            <Link href="/books">Devotional</Link>
          </div>

          <div className="footer-links">
            <h3>Support</h3>

            <p>📞 +91 90084 91459</p>

            <p>📧 bhakthibookshelf@gmail.com</p>

            <Link href="/contact">Contact Us</Link>

            <Link href="/privacy-policy">Privacy Policy</Link>

            <Link href="/terms-conditions">Terms & Conditions</Link>
          </div>

        </div>

        <div className="footer-bottom">
          © 2026 Bhakthi Bookshelf. All Rights Reserved.
        </div>

      </Container>
    </footer>
  );
}