"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import BookGrid from "@/app/components/books/BookGrid";
import BookSearch from "@/app/components/books/BookSearch";
import BookCount from "@/app/components/books/BookCount";
import LibraryHeader from "@/app/components/books/LibraryHeader";
import Container from "@/app/components/ui/Container";

import type { Book } from "@/app/lib/types/book";
import { useT } from "@/app/lib/i18n/I18nProvider";
import { BOOK_CATEGORIES, BookCategory, CATEGORY_LABEL } from "@/app/lib/categories";
import { matchesQuery } from "@/app/lib/bookSearch";
import { BOOK_LANGUAGES, BookLanguage, bookMatchesLanguage } from "@/app/lib/bookLanguage";

type Props = {
  books: Book[];
  initialCategory?: BookCategory | null;
  initialQuery?: string;
  initialLanguage?: BookLanguage;
};

type SortOption = "featured" | "title";

export default function BooksClient({
  books,
  initialCategory = null,
  initialQuery = "",
  initialLanguage = "all",
}: Props) {
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState<BookCategory | null>(initialCategory);
  const [language, setLanguage] = useState<BookLanguage>(initialLanguage);

  // Keep ?category= / ?lang= in the URL (shareable; footer links land here)
  // without a navigation/re-render round trip.
  function syncUrl(nextCategory: BookCategory | null, nextLanguage: BookLanguage) {
    const params = new URLSearchParams();
    if (nextCategory) params.set("category", nextCategory);
    if (nextLanguage !== "all") params.set("lang", nextLanguage);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }
  function chooseCategory(next: BookCategory | null) {
    setCategory(next);
    syncUrl(next, language);
  }
  function chooseLanguage(next: BookLanguage) {
    setLanguage(next);
    syncUrl(category, next);
  }
  const [sortBy, setSortBy] =
    useState<SortOption>("featured");

  const filteredBooks = useMemo(() => {
    const result = books.filter(
      (book) =>
        (!category || book.category === category) &&
        bookMatchesLanguage(book.language, language) &&
        matchesQuery(book, search)
    );

    switch (sortBy) {
      case "title":
        result.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        break;

      default:
        result.sort((a, b) => {
          if (a.featured === b.featured) return 0;
          return a.featured ? -1 : 1;
        });
    }

    return result;
  }, [books, search, sortBy, category, language]);

  return (
    <>
      <LibraryHeader />

      <section className="books-page">
        <Container>

          <div className="language-chips" role="tablist" aria-label={t("library.bookLanguage")}>
            <span className="language-chips-label">{t("library.bookLanguage")}:</span>
            {BOOK_LANGUAGES.map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                aria-selected={language === l}
                className={language === l ? "category-chip is-on" : "category-chip"}
                onClick={() => chooseLanguage(l)}
              >
                {l === "all" ? t("library.all") : l === "Kannada" ? "ಕನ್ನಡ" : "English"}
              </button>
            ))}
          </div>

          <div className="category-chips" role="tablist" aria-label={t("library.categories")}>
            {[null, ...BOOK_CATEGORIES].map((c) => (
              <button
                key={c ?? "all"}
                type="button"
                role="tab"
                aria-selected={category === c}
                className={category === c ? "category-chip is-on" : "category-chip"}
                onClick={() => chooseCategory(c)}
              >
                {c ? t(CATEGORY_LABEL[c]) : t("library.all")}
              </button>
            ))}
          </div>

          <div className="books-toolbar">

            <BookSearch
              value={search}
              onChange={setSearch}
            />

            <div className="books-sort">
              <select
                aria-label={t("library.sortBy")}
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as SortOption
                  )
                }
              >
                <option value="featured">
                  {t("library.sortFeatured")}
                </option>

                <option value="title">
                  {t("library.sortTitle")}
                </option>
              </select>
            </div>

          </div>

          <BookCount
            count={filteredBooks.length}
          />

          {filteredBooks.length === 0 ? (
            <div
              style={{
                padding: "60px",
                textAlign: "center",
              }}
            >
              <h2>{t("library.none")}</h2>

              <p>{t("library.noneHint")}</p>
            </div>
          ) : (
            <>
              {/* keeps headings in order (h1 → h2 → the cards' h3) for screen readers */}
              <h2 className="sr-only">{t("footer.books")}</h2>
              <BookGrid books={filteredBooks} />
            </>
          )}
        </Container>
      </section>
    </>
  );
}
