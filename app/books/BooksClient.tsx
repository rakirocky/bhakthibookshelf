"use client";

import { useMemo, useState } from "react";

import BookGrid from "@/app/components/books/BookGrid";
import BookSearch from "@/app/components/books/BookSearch";
import BookCount from "@/app/components/books/BookCount";
import LibraryHeader from "@/app/components/books/LibraryHeader";
import Container from "@/app/components/ui/Container";

import type { Book } from "@/app/lib/types/book";

type Props = {
  books: Book[];
};

type SortOption =
  | "featured"
  | "title"
  | "price-low"
  | "price-high";

export default function BooksClient({ books }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] =
    useState<SortOption>("featured");

  const filteredBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let result = books.filter((book) => {
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
                  Featured
                </option>

                <option value="title">
                  Title A-Z
                </option>

                <option value="price-low">
                  Price Low to High
                </option>

                <option value="price-high">
                  Price High to Low
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
              <h2>No books found</h2>

              <p>
                Try another search keyword.
              </p>
            </div>
          ) : (
            <BookGrid books={filteredBooks} />
          )}
        </Container>
      </section>
    </>
  );
}
