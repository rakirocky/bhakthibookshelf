"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  DeviceLimitError,
  downloadBook,
  listBooks,
} from "@/app/lib/offline/library";
import { useIsNativeApp } from "@/app/lib/offline/useNative";

/**
 * "Save for offline reading" — shown only inside the app, only when the
 * reader already has access to the book. On the website it renders
 * nothing (the normal download link stays).
 */
export default function OfflineSaveButton({
  bookId,
}: {
  bookId: number;
}) {
  const native = useIsNativeApp();
  const [state, setState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [downloadId, setDownloadId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!native) return;

    void listBooks().then((books) => {
      const hit = books.find((b) => b.bookId === bookId);
      if (hit) {
        setDownloadId(hit.downloadId);
        setState("saved");
      }
    });
  }, [native, bookId]);

  if (!native) return null;

  async function save() {
    setState("saving");
    setMessage("");
    try {
      const book = await downloadBook(bookId);
      setDownloadId(book.downloadId);
      setState("saved");
    } catch (err) {
      setState("error");
      setMessage(
        err instanceof DeviceLimitError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not save this book."
      );
    }
  }

  if (state === "saved" && downloadId) {
    return (
      <Link
        href={`/reader/${downloadId}`}
        className="btn btn-primary"
        style={{ textDecoration: "none" }}
      >
        Read offline
      </Link>
    );
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      <button
        type="button"
        className="btn btn-outline"
        onClick={save}
        disabled={state === "saving"}
      >
        {state === "saving" ? "Saving…" : "Save for offline reading"}
      </button>
      {state === "error" && (
        <span style={{ fontSize: 12, color: "var(--color-danger-text)" }}>
          {message}
        </span>
      )}
    </span>
  );
}
