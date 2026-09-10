"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { formatBytes } from "@/app/lib/offline/bytes";
import {
  LocalBookDetail,
  listBooksDetailed,
  reconcileLibrary,
  removeBook,
} from "@/app/lib/offline/library";
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
  const [books, setBooks] = useState<LocalBookDetail[] | null>(null);
  const [totalBytes, setTotalBytes] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const { books: list, totalBytes: total } = await listBooksDetailed();
    setBooks(list);
    setTotalBytes(total);
  }, []);

  useEffect(() => {
    if (!native) return;
    let alive = true;

    (async () => {
      setSyncing(true);
      const result = await reconcileLibrary();
      if (!alive) return;

      const bits: string[] = [];
      if (result.restored)
        bits.push(
          `restored ${result.restored} book${result.restored > 1 ? "s" : ""}`
        );
      if (result.dropped)
        bits.push(
          `removed ${result.dropped} no longer on your account`
        );
      setNotice(bits.length ? `Synced — ${bits.join(", ")}.` : null);

      await refresh();
      if (alive) setSyncing(false);
    })();

    return () => {
      alive = false;
    };
  }, [native, refresh]);

  async function handleRemove(downloadId: number) {
    if (!window.confirm("Remove this download from your device?")) return;
    setBusy(true);
    try {
      await removeBook(downloadId);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveAll() {
    if (!books || books.length === 0) return;
    if (
      !window.confirm(
        `Remove all ${books.length} downloads from this device? ` +
          "You can save them again any time."
      )
    )
      return;

    setBusy(true);
    try {
      for (const b of books) {
        await removeBook(b.downloadId);
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

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
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 6 }}>
        Saved on this device · readable offline
      </p>

      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-muted)",
          marginBottom: 18,
        }}
      >
        {books && books.length > 0
          ? `Using ${formatBytes(totalBytes)} on this device`
          : ""}
        {syncing ? (books && books.length ? " · syncing…" : "Syncing…") : ""}
      </p>

      {notice && (
        <p
          style={{
            fontSize: 13,
            color: "var(--color-success-text)",
            marginBottom: 16,
          }}
        >
          {notice}
        </p>
      )}

      {books === null && !syncing && (
        <p style={{ color: "var(--color-text-muted)" }}>Loading…</p>
      )}

      {books !== null && books.length === 0 && !syncing && (
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
                {b.sizeBytes > 0 && ` · ${formatBytes(b.sizeBytes)}`}
                {!b.available && " · no longer available for re-download"}
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
              disabled={busy}
              onClick={() => handleRemove(b.downloadId)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div
        style={{
          marginTop: 22,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Link
          href="/account/devices"
          style={{ fontSize: 14, color: "var(--color-primary)", fontWeight: 600 }}
        >
          Manage devices
        </Link>

        {books && books.length > 0 && (
          <button
            type="button"
            className="btn-danger-text"
            disabled={busy}
            onClick={handleRemoveAll}
          >
            Remove all downloads
          </button>
        )}
      </div>
    </main>
  );
}
