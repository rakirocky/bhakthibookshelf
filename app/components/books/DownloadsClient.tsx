"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import ContinueReading from "@/app/components/books/ContinueReading";
import OfflineSaveButton from "@/app/components/books/OfflineSaveButton";
import { useT } from "@/app/lib/i18n/I18nProvider";
import { formatBytes } from "@/app/lib/offline/bytes";
import {
  LocalBookDetail,
  listBooksDetailed,
  reconcileLibrary,
  removeBook,
} from "@/app/lib/offline/library";
/**
 * The Downloads screen — the only place a purchased book can be opened,
 * on the app or the website. Files are saved to this device (encrypted)
 * and read in the watermarked in-browser/in-app reader.
 */
export type PurchasedBook = {
  id: number;
  slug: string;
  title: string;
  author: string;
};

export default function DownloadsClient({
  purchased = [],
}: {
  purchased?: PurchasedBook[];
}) {
  const [books, setBooks] = useState<LocalBookDetail[] | null>(null);
  const [totalBytes, setTotalBytes] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { t } = useT();

  const refresh = useCallback(async () => {
    const { books: list, totalBytes: total } = await listBooksDetailed();
    setBooks(list);
    setTotalBytes(total);
  }, []);

  useEffect(() => {
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
  }, [refresh]);

  // Books this account owns that aren't on this device yet — otherwise a
  // fresh buyer lands on an empty page with nothing to click.
  const savedIds = new Set((books ?? []).map((b) => b.bookId));
  const notSaved =
    books === null ? [] : purchased.filter((p) => !savedIds.has(p.id));

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

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "28px 18px 48px",
      }}
    >
      <h1 style={{ fontSize: 24, color: "var(--color-navy)", marginBottom: 4 }}>
        {t("downloads.title")}
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 6 }}>
        {t("downloads.subtitle")}
      </p>

      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-muted)",
          marginBottom: 18,
        }}
      >
        {books && books.length > 0
          ? t("downloads.using", { size: formatBytes(totalBytes) })
          : ""}
        {syncing ? (books && books.length ? ` · ${t("downloads.syncing")}` : t("downloads.syncing")) : ""}
      </p>

      <ContinueReading />

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
        <p style={{ color: "var(--color-text-muted)" }}>{t("downloads.loading")}</p>
      )}

      {books !== null &&
        books.length === 0 &&
        notSaved.length === 0 &&
        !syncing && (
        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          {t("downloads.empty")}{" "}
          <strong>{t("offline.save")}</strong>.
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
              {t("downloads.read")}
            </Link>
            <button
              type="button"
              className="btn-danger-text"
              disabled={busy}
              onClick={() => handleRemove(b.downloadId)}
            >
              {t("downloads.remove")}
            </button>
          </li>
        ))}
      </ul>

      {notSaved.length > 0 && (
        <section style={{ marginTop: books && books.length > 0 ? 28 : 0 }}>
          <h2
            style={{
              fontSize: 17,
              color: "var(--color-navy)",
              marginBottom: 4,
            }}
          >
            {t("downloads.notSavedTitle")}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-muted)",
              marginBottom: 6,
            }}
          >
            {t("downloads.notSavedHint")}
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {notSaved.map((p) => (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  padding: "14px 0",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div style={{ flex: 1, minWidth: 160 }}>
                  <Link
                    href={`/books/${p.slug}`}
                    style={{ fontWeight: 600, color: "inherit" }}
                  >
                    {p.title}
                  </Link>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {p.author}
                  </div>
                </div>
                <OfflineSaveButton
                  bookId={p.id}
                  onSaved={() => void refresh()}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

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
          {t("downloads.manageDevices")}
        </Link>

        {books && books.length > 0 && (
          <button
            type="button"
            className="btn-danger-text"
            disabled={busy}
            onClick={handleRemoveAll}
          >
            {t("downloads.removeAll")}
          </button>
        )}
      </div>
    </main>
  );
}
