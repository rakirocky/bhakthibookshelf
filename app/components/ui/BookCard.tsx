"use client";

import Image from "next/image";
import Link from "next/link";

import { fileUrl } from "@/app/lib/upload/fileUrl";
import { useT } from "@/app/lib/i18n/I18nProvider";
import WishlistButton from "../wishlist/WishlistButton";

const NEW_BADGE_WINDOW_DAYS = 14;

type Props = {
  slug: string;
  title: string;
  author: string;
  price: number;
  cover?: string | null;
  createdAt?: Date | string | null;
};

function isRecentlyAdded(createdAt?: Date | string | null) {
  if (!createdAt) {
    return false;
  }

  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs < NEW_BADGE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export default function BookCard({
  slug,
  title,
  author,
  price,
  cover,
  createdAt,
}: Props) {
  const { t } = useT();
  return (
    <article className="book-card">
      <WishlistButton slug={slug} />

      <Link href={`/books/${slug}`}>

        <div className="book-image">

          {isRecentlyAdded(createdAt) && (
            <span className="book-badge">{t("card.new")}</span>
          )}

          <Image
            className="book-cover-image"
            src={
              fileUrl(cover) ||
              "/images/books/default-book.jpg"
            }
            alt={title}
            width={300}
            height={450}
            priority={false}
          />

        </div>

      </Link>

      <div className="book-details">

        <h3>{title}</h3>

        <p className="author">
          {author}
        </p>

        <div className="price" data-web-only>

          ₹{price}

        </div>

        <Link
          href={`/books/${slug}`}
          className="book-button"
        >
          {t("card.viewDetails")}
        </Link>

      </div>
    </article>
  );
}
