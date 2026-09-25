import { Book } from "../../lib/types/book";
import Link from "next/link";

import { getT } from "../../lib/i18n/server";
import { CATEGORY_LABEL, normalizeCategory } from "../../lib/categories";

type Props = {
  book: Book;
};

export default async function BookInfo({
  book,
}: Props) {
  const t = await getT();
  const category = normalizeCategory(book.category);
  const languageLabel =
    book.language === "English" || book.language === "Kannada"
      ? t(`lang.${book.language}`)
      : book.language;

  const sellingPrice =
    Number(book.discount_price ?? book.price);

  return (
    <section className="book-info">

      {category && (
        <Link href={`/books?category=${category}`} className="book-category">
          {t(CATEGORY_LABEL[category])}
        </Link>
      )}

      <h1>{book.title}</h1>

      {book.subtitle && (
        <h3>{book.subtitle}</h3>
      )}

      <div className="book-meta">

        <p>
          <strong>{t("book.author")}</strong><br />
          {book.author}
        </p>

        <p>
          <strong>{t("book.publisher")}</strong><br />
          {book.publisher || "-"}
        </p>

        <p>
          <strong>{t("book.language")}</strong><br />
          {languageLabel}
        </p>

        <p>
          <strong>{t("book.pages")}</strong><br />
          {book.pages || "-"}
        </p>

      </div>

      <div className="book-price" data-web-only>

        {book.discount_price && (
          <span
            style={{
              textDecoration: "line-through",
              marginRight: 12,
              opacity: .6
            }}
          >
            ₹{book.price}
          </span>
        )}

        <span
          style={{
            fontSize: "2rem",
            fontWeight: 700
          }}
        >
          ₹{sellingPrice}
        </span>

      </div>

    </section>
  );
}
