"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LocalBook, listBooks } from "@/app/lib/offline/library";
import { BookProgress, getAllProgress } from "@/app/lib/offline/readingProgress";
import { useT } from "@/app/lib/i18n/I18nProvider";

/**
 * "Continue reading" — the book most recently open in the reader on
 * this device, with how far along it is. Renders nothing until there is
 * something to resume (nothing saved offline, or never opened).
 */
export default function ContinueReading({ compact = false }: { compact?: boolean }) {
  const [item, setItem] = useState<{ book: LocalBook; progress: BookProgress } | null>(null);
  const { t } = useT();

  useEffect(() => {
    let alive = true;
    (async () => {
      const [books, progress] = await Promise.all([listBooks(), getAllProgress()]);
      const latest = books
        .map((book) => ({ book, progress: progress[String(book.downloadId)] }))
        .filter((x) => x.progress)
        .sort((a, b) => b.progress.updatedAt - a.progress.updatedAt)[0];
      if (alive && latest) setItem(latest);
    })().catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  if (!item) return null;

  const { book, progress } = item;
  const pct = progress.total ? Math.round((progress.page / progress.total) * 100) : 0;
  const finished = progress.total > 0 && progress.page >= progress.total;

  return (
    <div className={compact ? "continue-reading continue-reading--compact" : "continue-reading"}>
      <div className="continue-reading__icon" aria-hidden="true">📖</div>
      <div className="continue-reading__body">
        <span className="continue-reading__label">
          {finished ? t("continue.finished") : t("continue.label")}
        </span>
        <strong className="continue-reading__title">{book.title}</strong>
        <span className="continue-reading__meta">
          {t("continue.meta", { page: progress.page, total: progress.total, pct })}
        </span>
        <span className="continue-reading__bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </span>
      </div>
      <Link href={`/reader/${book.downloadId}`} className="btn btn-primary continue-reading__cta">
        {finished ? t("continue.open") : t("continue.resume")}
      </Link>
    </div>
  );
}
