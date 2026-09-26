"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import CartBadge from "../cart/CartBadge";
import WishlistBadge from "../wishlist/WishlistBadge";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchOverlay from "./SearchOverlay";
import { useT } from "@/app/lib/i18n/I18nProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useT();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const searchButton = (extraClass: string) => (
    <button
      type="button"
      className={`nav-search ${extraClass}`}
      aria-label={t("search.open")}
      onClick={() => {
        setMenuOpen(false);
        setSearchOpen(true);
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    </button>
  );

  // The admin section has its own header/sidebar — showing the storefront
  // navbar on top of it just wastes space and duplicates branding.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="navbar">

      <div className="container">

        <Link
          href="/"
          className="brand"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/images/logo.png"
            alt="Bhakthi Bookshelf"
            width={60}
            height={60}
            priority
          />

          <div>

            <h2>
              Bhakthi Bookshelf
            </h2>

            <span>
              {t("brand.tagline")}
            </span>

          </div>

        </Link>

        {searchButton("nav-search--mobile")}

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={
            menuOpen ? "nav-links open" : "nav-links"
          }
        >
          <Link href="/" onClick={() => setMenuOpen(false)}>
            {t("nav.home")}
          </Link>

          <Link
            href="/books"
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.library")}
          </Link>

          <Link
            href="/about"
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.about")}
          </Link>

          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.contact")}
          </Link>

          <Link
            href="/subscribe"
            onClick={() => setMenuOpen(false)}
            data-web-only
          >
            {t("nav.subscribe")}
          </Link>

          <Link
            href="/downloads"
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.downloads")}
          </Link>

          <Link
            href="/account"
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.myAccount")}
          </Link>

          {searchButton("nav-search--desktop")}

          <LanguageSwitcher />

          <span data-web-only className="nav-badges">
            <WishlistBadge />
            <CartBadge />
          </span>

        </nav>

      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
