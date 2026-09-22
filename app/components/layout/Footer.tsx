import Link from "next/link";
import { Phone, Mail, Smartphone, Download } from "lucide-react";

import Container from "../ui/Container";

// lucide-react@1.47.0 (pinned in package.json) doesn't ship an Instagram
// icon — inlined instead of bumping a shared dependency for one glyph.
function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// lucide-react@1.47.0 (pinned) has no brand icons for either store —
// inlined for the same reason as InstagramIcon above.
function PlayStoreIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.7 2.3c-.4.4-.7 1-.7 1.7v16c0 .7.3 1.3.7 1.7l.1.1L14 12.5v-.1L4.8 2.2l-.1.1z" />
      <path d="M17.1 15.6 14 12.5v-.1l3.1-3.1 6.9 3.9c.9.5.9 1.4 0 1.9l-6.9 3.9-.1-.1zM6.2 21.8l7.6-7.6.1.1-7.6 7.6-.1-.1zm7.7-9.2-.1.1L6.2 2.2l7.7 9.2v.9.1z" />
    </svg>
  );
}

function AppleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.7 12.7c0-3 2.5-4.4 2.6-4.5-1.4-2-3.5-2.3-4.3-2.4-1.8-.2-3.6 1.1-4.5 1.1-.9 0-2.4-1-3.9-1-2 0-3.9 1.2-4.9 3-2.1 3.7-.5 9.1 1.5 12.1 1 1.5 2.1 3.1 3.7 3 1.5-.1 2-1 3.8-1s2.2 1 3.8 1c1.6 0 2.6-1.4 3.5-2.9.7-1 1.1-2.1 1.4-3.2-2.3-.9-2.7-3.9-2.7-4.2z" />
      <path d="M14.3 4.1c.8-1 1.3-2.3 1.2-3.6-1.1.1-2.5.8-3.3 1.7-.7.8-1.4 2.1-1.2 3.4 1.3.1 2.5-.6 3.3-1.5z" />
    </svg>
  );
}

// Direct APK link — there's no Play Store/App Store listing yet (still
// pending submission), so this points straight at the signed release build.
// Swap this for the real store link(s) once that submission goes live.
const APP_DOWNLOAD_URL = "https://bhakthibookshelf.in/downloads/bhakthi-bookshelf.apk";

const INSTAGRAM_URL = "https://www.instagram.com/bb_scroll?stkn=eGdsdWNtOHVseHV5";

// Neither listing exists yet — see docs/play-store-listing.md (Play submission
// still needs a developer account + Play Billing decision) and
// android-capacitor-build-env notes (iOS needs a Mac/Xcode Cloud, not built
// at all yet). Set these once each store listing is actually live; the icons
// below only render when their URL is non-null, so nothing links to a 404
// or an unrelated page in the meantime.
const PLAY_STORE_URL: string | null = null;
const APP_STORE_URL: string | null = null;

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

            <div className="footer-social">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Bhakthi Bookshelf on Instagram"
              >
                <InstagramIcon />
              </a>

              {PLAY_STORE_URL && (
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bhakthi Bookshelf on Google Play"
                >
                  <PlayStoreIcon />
                </a>
              )}

              {APP_STORE_URL && (
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bhakthi Bookshelf on the App Store"
                >
                  <AppleIcon />
                </a>
              )}
            </div>
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