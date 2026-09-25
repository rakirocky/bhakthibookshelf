"use client";

import { useMemo, useState } from "react";

import BookGrid from "@/app/components/books/BookGrid";
import BookSearch from "@/app/components/books/BookSearch";
import BookCount from "@/app/components/books/BookCount";
import LibraryHeader from "@/app/components/books/LibraryHeader";
import Container from "@/app/components/ui/Container";

import type { Book } from "@/app/lib/types/book";
import { useT } from "@/app/lib/i18n/I18nProvider";

type Props = {
  books: Book[];
};

type SortOption =
  | "featured"
  | "title"
  | "price-low"
  | "price-high";

export default function BooksClient({ books }: Props) {
  const { t } = useT();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] =
    useState<SortOption>("featured");

  const filteredBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const result = books.filter((book) => {
      return (
        book.title.toLowerCase().includes(keyword) ||
        book.author.toLowerCase().includes(keyword)
      );
    });

    switch (sortBy) {
      case "title":
        result.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        break;

      case "price-low":
        result.sort(
          (a, b) =>
            Number(a.discount_price ?? a.price) -
            Number(b.discount_price ?? b.price)
        );
        break;

      case "price-high":
        result.sort(
          (a, b) =>
            Number(b.discount_price ?? b.price) -
            Number(a.discount_price ?? a.price)
        );
        break;

      default:
        result.sort((a, b) => {
          if (a.featured === b.featured) return 0;
          return a.featured ? -1 : 1;
        });
    }

    return result;
  }, [books, search, sortBy]);

  return (
    <>
      <LibraryHeader />

      <section className="books-page">
        <Container>

          <div className="books-toolbar">

            <BookSearch
              value={search}
              onChange={setSearch}
            />

            <div className="books-sort">
              <select
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

                <option value="price-low" data-web-only>
                  {t("library.sortPriceLow")}
                </option>

                <option value="price-high" data-web-only>
                  {t("library.sortPriceHigh")}
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
            <BookGrid books={filteredBooks} />
          )}
        </Container>
      </section>
    </>
  );
}
