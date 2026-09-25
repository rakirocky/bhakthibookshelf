"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useT } from "@/app/lib/i18n/I18nProvider";
import { matchesQuery, searchScore } from "@/app/lib/bookSearch";
import { fileUrl } from "@/app/lib/upload/fileUrl";

interface IndexBook {
  slug: string;
  title: string;
  subtitle: string | null;
  author: string | null;
  description: string | null;
  cover_image: string | null;
  language: string | null;
}

const MAX_RESULTS = 8;

/** Header 🔍 — instant search across the catalogue from any page. */
export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { t } = useT();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [books, setBooks] = useState<IndexBook[] | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let alive = true;
    fetch("/api/books/search-index")
      .then((r) => r.json())
      .then((list: IndexBook[]) => alive && setBooks(list))
      .catch(() => alive && setBooks([]));
    return () => {
      alive = false;
      document.body.style.overflow = prev;
    };
  }, []);

  const results = useMemo(() => {
    if (!books || !query.trim()) return [];
    return books
      .filter((b) => matchesQuery(b, query))
      .sort((a, b) => searchScore(b, query) - searchScore(a, query))
      .slice(0, MAX_RESULTS);
  }, [books, query]);

  function open(slug: string) {
    onClose();
    router.push(`/books/${slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      open(results[active].slug);
    }
  }

  return createPortal(
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label={t("search.open")} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-panel">
        <div className="search-panel__bar">
          <span aria-hidden="true">🔍</span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            placeholder={t("search.placeholder")}
            aria-label={t("search.open")}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          <button type="button" onClick={onClose} aria-label={t("search.close")}>
            ✕
          </button>
        </div>

        <div className="search-panel__body">
          {!query.trim() && <p className="search-panel__hint">{t("search.hint")}</p>}

          {query.trim() && books && results.length === 0 && (
            <p className="search-panel__hint">{t("search.none", { q: query.trim() })}</p>
          )}

          <ul className="search-results">
            {results.map((b, i) => (
              <li key={b.slug}>
                <Link
                  href={`/books/${b.slug}`}
                  className={i === active ? "search-result is-active" : "search-result"}
                  onMouseEnter={() => setActive(i)}
                  onClick={onClose}
                >
                  <Image
                    src={fileUrl(b.cover_image) || "/images/books/default-book.jpg"}
                    alt=""
                    width={44}
                    height={64}
                  />
                  <span>
                    <strong>{b.title}</strong>
                    <small>
                      {[b.author, b.language === "Kannada" ? t("lang.Kannada") : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {results.length > 0 && (
            <Link
              href={`/books?q=${encodeURIComponent(query.trim())}`}
              className="search-panel__all"
              onClick={onClose}
            >
              {t("search.seeAll")}
            </Link>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
