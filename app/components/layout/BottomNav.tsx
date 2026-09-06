"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "@/app/hooks/useCart";

import LanguageSwitcher from "./LanguageSwitcher";

/**
 * App-style bottom tab bar for small screens / the Capacitor shell.
 *
 * The storefront top navbar collapses everything behind a hamburger on
 * mobile, which is fine for a website but wrong for an app. This gives the
 * four primary destinations (Home, Library, Account, Cart) permanent
 * one-tap reach, and tucks the secondary links (About, Contact, Subscribe,
 * Downloads, language) into a "More" sheet — the pattern almost every
 * content app uses.
 *
 * Rendered globally but CSS-hidden above 860px, where the top navbar
 * already shows every link inline. Hidden on /admin, which has its own
 * chrome.
 */

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** match nested routes too, e.g. /books/123 still lights up "Library" */
  matchPrefix?: boolean;
};

const TABS: Tab[] = [
  {
    href: "/",
    label: "Home",
    icon: (
      <path d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" />
    ),
  },
  {
    href: "/books",
    label: "Library",
    matchPrefix: true,
    icon: (
      <>
        <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
        <path d="M4 19a2 2 0 0 0 2 2h13" />
      </>
    ),
  },
  {
    href: "/account",
    label: "Account",
    matchPrefix: true,
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </>
    ),
  },
];

const MORE_LINKS = [
  { href: "/downloads", label: "Downloads" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function TabIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [moreOpen, setMoreOpen] = useState(false);

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (!moreOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [moreOpen]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isActive = (tab: Pick<Tab, "href" | "matchPrefix">) => {
    if (tab.href === "/") return pathname === "/";
    if (tab.matchPrefix) return pathname?.startsWith(tab.href) ?? false;
    return pathname === tab.href;
  };

  const moreActive = MORE_LINKS.some(
    (l) => pathname === l.href || pathname?.startsWith(`${l.href}/`),
  );

  return (
    <>
      <div className="bottom-nav-spacer" aria-hidden="true" />

      <nav className="bottom-nav" aria-label="Primary">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={isActive(tab) ? "bottom-nav__item is-active" : "bottom-nav__item"}
            aria-current={isActive(tab) ? "page" : undefined}
          >
            <TabIcon>{tab.icon}</TabIcon>
            <span>{tab.label}</span>
          </Link>
        ))}

        <Link
          href="/cart"
          className={
            pathname === "/cart"
              ? "bottom-nav__item is-active"
              : "bottom-nav__item"
          }
          aria-current={pathname === "/cart" ? "page" : undefined}
        >
          <span className="bottom-nav__icon-wrap">
            <TabIcon>
              <>
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="18" cy="20" r="1.4" />
                <path d="M2.5 3.5h2l2.4 12.1a1.5 1.5 0 0 0 1.5 1.2h9.1a1.5 1.5 0 0 0 1.5-1.2L21.5 7H6" />
              </>
            </TabIcon>
            {cartCount > 0 && (
              <span className="bottom-nav__badge">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </span>
          <span>Cart</span>
        </Link>

        <button
          type="button"
          className={
            moreActive || moreOpen
              ? "bottom-nav__item is-active"
              : "bottom-nav__item"
          }
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
        >
          <TabIcon>
            <>
              <circle cx="5" cy="12" r="1.4" />
              <circle cx="12" cy="12" r="1.4" />
              <circle cx="19" cy="12" r="1.4" />
            </>
          </TabIcon>
          <span>More</span>
        </button>
      </nav>

      {moreOpen && (
        <div
          className="more-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="More"
        >
          <div
            className="more-sheet__scrim"
            onClick={() => setMoreOpen(false)}
          />
          <div className="more-sheet__panel">
            <div className="more-sheet__grip" aria-hidden="true" />
            <div className="more-sheet__links">
              {MORE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="more-sheet__link"
                  onClick={() => setMoreOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="more-sheet__footer">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
