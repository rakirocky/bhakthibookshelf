"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { fileUrl } from "@/app/lib/upload/fileUrl";

export type HeroBook = {
  id: number;
  slug: string;
  title: string;
  cover_image: string | null;
};

type Props = {
  books: HeroBook[];
};

function coverSrc(book: HeroBook) {
  return fileUrl(book.cover_image) || "/images/books/default-book.jpg";
}

export default function HeroBookshelf({ books }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (books.length === 0) {
    return null;
  }

  const activeBook = books[activeIndex];
  const canSlide = books.length > 1;
  const prevBook = books[(activeIndex - 1 + books.length) % books.length];
  const nextBook = books[(activeIndex + 1) % books.length];

  function showPrev() {
    setActiveIndex((current) => (current - 1 + books.length) % books.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % books.length);
  }

  return (
    <div className="hero-slider">
      <div className="hero-slider-row">
        {canSlide && (
          <button
            type="button"
            className="hero-slider-arrow hero-slider-arrow-left"
            onClick={showPrev}
            aria-label="Previous cover"
          >
            &#8249;
          </button>
        )}

        <div className="hero-slider-track">
          {canSlide && (
            <button
              type="button"
              className="hero-slide-peek hero-slide-peek-left"
              onClick={showPrev}
              aria-label={`View ${prevBook.title}`}
            >
              <Image
                key={prevBook.id}
                src={coverSrc(prevBook)}
                alt=""
                fill
                sizes="220px"
                style={{ objectFit: "cover" }}
              />
            </button>
          )}

          <div className="hero-slide">
            <Link
              href={`/books/${activeBook.slug}`}
              className="hero-slide-cover"
              aria-label={`View ${activeBook.title}`}
            >
              <Image
                key={activeBook.id}
                src={coverSrc(activeBook)}
                alt={activeBook.title}
                fill
                sizes="300px"
                style={{ objectFit: "cover" }}
                priority
              />
            </Link>
          </div>

          {canSlide && (
            <button
              type="button"
              className="hero-slide-peek hero-slide-peek-right"
              onClick={showNext}
              aria-label={`View ${nextBook.title}`}
            >
              <Image
                key={nextBook.id}
                src={coverSrc(nextBook)}
                alt=""
                fill
                sizes="220px"
                style={{ objectFit: "cover" }}
              />
            </button>
          )}
        </div>

        {canSlide && (
          <button
            type="button"
            className="hero-slider-arrow hero-slider-arrow-right"
            onClick={showNext}
            aria-label="Next cover"
          >
            &#8250;
          </button>
        )}
      </div>

      {canSlide && (
        <div className="hero-slider-dots">
          {books.map((book, i) => (
            <button
              key={book.id}
              type="button"
              className={
                i === activeIndex
                  ? "hero-slider-dot is-active"
                  : "hero-slider-dot"
              }
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to ${book.title}`}
              aria-current={i === activeIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}
