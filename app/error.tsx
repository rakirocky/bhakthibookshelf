"use client";

import Link from "next/link";
import { useEffect } from "react";

import { reportClientError } from "./lib/monitoring/reportClientError";
import { useT } from "./lib/i18n/I18nProvider";

/** Friendly fallback when a page crashes (the header/footer stay). */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useT();

  useEffect(() => {
    reportClientError(error, "error-boundary", error.digest);
  }, [error]);

  return (
    <main className="page-container error-page">
      <section className="page-header">
        <h1>🙏 {t("error.title")}</h1>
        <p>{t("error.text")}</p>
      </section>
      <div className="error-page__actions">
        <button type="button" className="hero-button" onClick={reset}>
          {t("error.retry")}
        </button>
        <Link href="/" className="book-button">
          {t("error.home")}
        </Link>
      </div>
    </main>
  );
}
