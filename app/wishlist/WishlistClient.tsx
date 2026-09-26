"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import BookCard from "../components/ui/BookCard";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../hooks/useCart";
import { useToast } from "../context/ToastContext";
import { useT } from "../lib/i18n/I18nProvider";

type IndexBook = {
  id: number;
  slug: string;
  title: string;
  author: string | null;
  cover_image: string | null;
  price: number;
};

/**
 * The saved books, looked up fresh from the search index (all languages,
 * not just the navbar filter) so titles/prices are current and books
 * that were unpublished simply drop out.
 */
export default function WishlistClient() {
  const { t } = useT();
  const { slugs, remove, ready } = useWishlist();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [index, setIndex] = useState<Map<string, IndexBook> | null>(null);

  useEffect(() => {
    fetch("/api/books/search-index?all=1")
      .then((res) => (res.ok ? res.json() : []))
      .then((books: IndexBook[]) => setIndex(new Map(books.map((b) => [b.slug, b]))))
      .catch(() => setIndex(new Map()));
  }, []);

  const books = index ? slugs.map((s) => index.get(s)).filter((b): b is IndexBook => Boolean(b)) : [];
  const loading = !ready || !index;

  return (
    <>
      <section className="page-header">
        <h1>{t("wishlist.title")}</h1>
        <p>{t("wishlist.subtitle")}</p>
      </section>

      {loading ? null : books.length === 0 ? (
        <div className="wishlist-empty">
          <p>{t("wishlist.empty")}</p>
          <Link href="/books" className="book-button">
            {t("wishlist.browse")}
          </Link>
        </div>
      ) : (
        <div className="books-grid wishlist-grid">
          {books.map((book) => (
            <div key={book.slug} className="wishlist-item">
              <BookCard
                slug={book.slug}
                title={book.title}
                author={book.author ?? ""}
                price={book.price}
                cover={book.cover_image}
              />
              <div className="wishlist-item__actions">
                <button
                  type="button"
                  className="wishlist-item__cart"
                  onClick={() => {
                    addItem({
                      id: book.id,
                      slug: book.slug,
                      title: book.title,
                      author: book.author ?? "",
                      cover: book.cover_image,
                      price: book.price,
                    });
                    showToast(t("wishlist.addedToCart"));
                  }}
                >
                  {t("book.addToCart")}
                </button>
                <button type="button" className="wishlist-item__remove" onClick={() => remove(book.slug)}>
                  {t("wishlist.removeShort")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
