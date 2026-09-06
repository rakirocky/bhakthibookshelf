"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LocalBook, listBooks, removeBook } from "@/app/lib/offline/library";
import { useIsNativeApp } from "@/app/lib/offline/useNative";

/**
 * The real Downloads screen — active only inside the app. On the website
 * it renders `fallback` (the "open the app" explainer).
 */
export default function DownloadsClient({
  fallback,
}: {
  fallback: React.ReactNode;
}) {
  const native = useIsNativeApp();
  const [books, setBooks] = useState<LocalBook[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!native) return;
    let alive = true;

    listBooks().then((list) => {
      if (alive) setBooks(list);
    });

    return () => {
      alive = false;
    };
  }, [native, reloadKey]);

  if (!native) return <>{fallback}</>;

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "28px 18px 48px",
      }}
    >
      <h1 style={{ fontSize: 24, color: "var(--color-navy)", marginBottom: 4 }}>
        Downloads
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 22 }}>
        Saved on this device · readable offline
      </p>

      {books === null && (
        <p style={{ color: "var(--color-text-muted)" }}>Loading…</p>
      )}

      {books !== null && books.length === 0 && (
        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          No downloads yet. Open a book you own and tap{" "}
          <strong>Save for offline reading</strong>.
        </p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {(books ?? []).map((b) => (
          <li
            key={b.downloadId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 0",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{b.title}</div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                }}
              >
                {b.author}
              </div>
            </div>
            <Link
              href={`/reader/${b.downloadId}`}
              className="btn btn-primary"
              style={{ textDecoration: "none", padding: "8px 16px" }}
            >
              Read
            </Link>
            <button
              type="button"
              className="btn-danger-text"
              onClick={async () => {
                await removeBook(b.downloadId);
                setReloadKey((k) => k + 1);
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
