import Link from "next/link";
import { Phone, Mail, Smartphone, Download } from "lucide-react";

import Container from "../ui/Container";
import { SOCIAL_LINKS } from "./SocialLinks";
import { getT } from "../../lib/i18n/server";


// lucide-react@1.47.0 (pinned) has no brand icons for either store —
// inlined for the same reason as the icons in SocialLinks.tsx.
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


// Neither listing exists yet — see docs/play-store-listing.md (Play submission
// still needs a developer account + Play Billing decision) and
// android-capacitor-build-env notes (iOS needs a Mac/Xcode Cloud, not built
// at all yet). Set these once each store listing is actually live; the icons
// below only render when their URL is non-null, so nothing links to a 404
// or an unrelated page in the meantime.
const PLAY_STORE_URL: string | null = null;
const APP_STORE_URL: string | null = null;

export default async function Footer() {
  const t = await getT();

  return (
    <footer className="footer">
      <Container>

        <div className="footer-top">

          <div className="footer-brand">
            <h2>Bhakthi Bookshelf</h2>

            <p className="footer-tagline">
              {t("brand.tagline")}
            </p>

            <p className="footer-description">
              {t("footer.about")}
            </p>

            <div className="footer-social">
              {SOCIAL_LINKS.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow Bhakthi Bookshelf on ${name}`}
                  title={name}
                >
                  <Icon />
                </a>
              ))}

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
            <h3>{t("footer.quickLinks")}</h3>

            <Link href="/">{t("nav.home")}</Link>

            <Link href="/books">{t("footer.books")}</Link>

            <Link href="/about">{t("nav.about")}</Link>

            <Link href="/contact">{t("nav.contact")}</Link>
          </div>

          <div className="footer-links">
            <h3>{t("footer.categories")}</h3>

            <Link href="/books?category=scriptures">{t("footer.scriptures")}</Link>

            <Link href="/books?category=epics">{t("footer.epics")}</Link>

            <Link href="/books?category=prayers">{t("footer.prayers")}</Link>

            <Link href="/books?category=devotional">{t("footer.devotional")}</Link>
          </div>

          <div className="footer-links">
            <h3>{t("footer.support")}</h3>

            <p><Phone size={16} /> +91 78921 19482</p>

            <p><Mail size={16} /> bhakthibookshelf@gmail.com</p>

            <Link href="/contact">{t("footer.contactUs")}</Link>

            <Link href="/privacy-policy">{t("footer.privacy")}</Link>

            <Link href="/terms-conditions">{t("footer.terms")}</Link>
          </div>

        </div>

        <div className="footer-app" data-web-only>
          <div className="footer-app-text">
            <Smartphone />
            <div>
              <strong>{t("footer.appTitle")}</strong>
              <p>{t("footer.appText")}</p>
            </div>
          </div>

          <a
            href={APP_DOWNLOAD_URL}
            className="footer-app-button"
          >
            <Download size={18} />
            {t("footer.appButton")}
          </a>
        </div>

        <div className="footer-bottom">
          {t("footer.rights")}
        </div>

      </Container>
    </footer>
  );
}