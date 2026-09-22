import Link from "next/link";
import { Phone, Mail, Smartphone, Download } from "lucide-react";

import Container from "../ui/Container";

// Direct APK link — there's no Play Store/App Store listing yet (still
// pending submission), so this points straight at the signed release build.
// Swap this for the real store link(s) once that submission goes live.
const APP_DOWNLOAD_URL = "https://bhakthibookshelf.in/downloads/bhakthi-bookshelf.apk";

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

            <p><Phone size={16} /> +91 78921 19482</p>

            <p><Mail size={16} /> bhakthibookshelf@gmail.com</p>

            <Link href="/contact">Contact Us</Link>

            <Link href="/privacy-policy">Privacy Policy</Link>

            <Link href="/terms-conditions">Terms & Conditions</Link>
          </div>

        </div>

        <div className="footer-app">
          <div className="footer-app-text">
            <Smartphone />
            <div>
              <strong>Get the Bhakthi Bookshelf app</strong>
              <p>Read offline, download once, carry your library anywhere.</p>
            </div>
          </div>

          <a
            href={APP_DOWNLOAD_URL}
            className="footer-app-button"
          >
            <Download size={18} />
            Download for Android
          </a>
        </div>

        <div className="footer-bottom">
          © 2026 Bhakthi Bookshelf. All Rights Reserved.
        </div>

      </Container>
    </footer>
  );
}