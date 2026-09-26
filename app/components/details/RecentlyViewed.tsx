"use client";

import { useEffect, useState } from "react";

import BookCard from "../ui/BookCard";
import { useT } from "@/app/lib/i18n/I18nProvider";

const STORAGE_KEY = "bb_recently_viewed";
const MAX_REMEMBERED = 12;
const MAX_SHOWN = 4;

type IndexBook = {
  slug: string;
  title: string;
  author: string | null;
  cover_image: string | null;
  price: number;
};

/** Slugs of books opened on this device, newest first. */
function readSlugs(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeSlugs(slugs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs.slice(0, MAX_REMEMBERED)));
  } catch {
    // private mode / storage blocked — the strip just stays empty
  }
}

/**
 * "Recently viewed" on a book page — remembers the books opened on this
 * device (localStorage, slugs only) and shows the last few, looked up
 * fresh from /api/books/search-index so titles and prices are current
 * and unpublished books drop out.
 */
export default function RecentlyViewed({ current }: { current: { slug: string } }) {
  const { t } = useT();
  const [books, setBooks] = useState<IndexBook[]>([]);

  useEffect(() => {
    const previous = readSlugs().filter((s) => s !== current.slug);
    writeSlugs([current.slug, ...previous]);
    if (previous.length === 0) return;

    let cancelled = false;
    fetch("/api/books/search-index")
      .then((res) => (res.ok ? res.json() : []))
      .then((index: IndexBook[]) => {
        if (cancelled) return;
        const bySlug = new Map(index.map((b) => [b.slug, b]));
        setBooks(
          previous
            .map((slug) => bySlug.get(slug))
            .filter((b): b is IndexBook => Boolean(b))
            .slice(0, MAX_SHOWN)
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [current.slug]);

  if (books.length === 0) return null;

  return (
    <section className="related-books recently-viewed">
      <h2>{t("book.recentlyViewed")}</h2>

      <div className="books-grid">
        {books.map((book) => (
          <BookCard
            key={book.slug}
            slug={book.slug}
            title={book.title}
            author={book.author ?? ""}
            price={book.price}
            cover={book.cover_image}
          />
        ))}
      </div>
    </section>
  );
}
