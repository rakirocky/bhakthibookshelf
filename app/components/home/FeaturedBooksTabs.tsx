"use client";

import Link from "next/link";
import { useState } from "react";

import BookCard from "../ui/BookCard";
import Button from "../ui/Button";
import { useT } from "../../lib/i18n/I18nProvider";
import { BOOK_LANGUAGES, BookLanguage } from "../../lib/bookLanguage";

export type FeaturedCard = {
  id: number;
  slug: string;
  title: string;
  author: string;
  price: number;
  cover?: string | null;
  createdAt?: Date | string | null;
};

// Featured Books' Language tabs (All / English / ಕನ್ನಡ): only change which
// books are shown — the interface stays in the language it is in.
export default function FeaturedBooksTabs({
  booksByLanguage,
  initialLanguage,
}: {
  booksByLanguage: Record<BookLanguage, FeaturedCard[]>;
  initialLanguage: BookLanguage;
}) {
  const { t } = useT();
  const [language, setLanguage] = useState<BookLanguage>(initialLanguage);
  const books = booksByLanguage[language] ?? [];
  const langName =
    language === "Kannada" ? t("lang.Kannada") : t("lang.English");

  return (
    <>
      <div className="language-chips" role="tablist" aria-label={t("library.bookLanguage")}>
        <span className="language-chips-label">{t("library.bookLanguage")}:</span>
        {BOOK_LANGUAGES.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={language === l}
            className={language === l ? "category-chip is-on" : "category-chip"}
            onClick={() => setLanguage(l)}
          >
            {l === "all" ? t("library.all") : l === "Kannada" ? "ಕನ್ನಡ" : "English"}
          </button>
        ))}
      </div>

      {books.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "24px 16px",
            margin: "0 auto",
            maxWidth: 420,
            borderRadius: 16,
            border: "1px dashed rgba(217, 119, 6, 0.5)",
            background: "rgba(255, 251, 241, 0.85)",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>🪔</div>
          <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#7c2d12" }}>
            {t("soon.title", { lang: langName })}
          </p>
          <p style={{ margin: 0, fontSize: 14 }}>
            <Link href="/books" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
              {t("soon.browse")}
            </Link>
          </p>
        </div>
      )}

      <div className="books-grid">
        {books.map((book) => (
          <BookCard
            key={book.id}
            slug={book.slug}
            title={book.title}
            author={book.author}
            price={book.price}
            cover={book.cover}
            createdAt={book.createdAt}
          />
        ))}
      </div>

      <div className="view-all-books">
        <Button
          href={language === "all" ? "/books" : `/books?lang=${language}`}
          text={t("featured.viewAll")}
        />
      </div>
    </>
  );
}
