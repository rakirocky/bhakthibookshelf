"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import CartBadge from "../cart/CartBadge";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);

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
              A Home for Devotional Reading
            </span>

          </div>

        </Link>

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
            Home
          </Link>

          <Link
            href="/books"
            onClick={() => setMenuOpen(false)}
          >
            Library
          </Link>

          <Link
            href="/about"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>

          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>

          <Link
            href="/subscribe"
            onClick={() => setMenuOpen(false)}
          >
            Subscribe
          </Link>

          <Link
            href="/account"
            onClick={() => setMenuOpen(false)}
          >
            My Account
          </Link>

          <LanguageSwitcher />

          <CartBadge />

        </nav>

      </div>

    </header>
  );
}
