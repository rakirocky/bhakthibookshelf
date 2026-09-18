"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  DeviceLimitError,
  downloadBook,
  listBooks,
} from "@/app/lib/offline/library";

/**
 * "Save for offline reading" — the only way to get a purchased book onto
 * this device (app or browser). The file is encrypted at rest and only
 * ever opened inside the watermarked reader; there is no plain-PDF
 * download anymore.
 */
export default function OfflineSaveButton({
  bookId,
}: {
  bookId: number;
}) {
  const [state, setState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [downloadId, setDownloadId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [atDeviceLimit, setAtDeviceLimit] = useState(false);

  useEffect(() => {
    void listBooks().then((books) => {
      const hit = books.find((b) => b.bookId === bookId);
      if (hit) {
        setDownloadId(hit.downloadId);
        setState("saved");
      }
    });
  }, [bookId]);

  async function save() {
    setState("saving");
    setMessage("");
    setAtDeviceLimit(false);
    try {
      const book = await downloadBook(bookId);
      setDownloadId(book.downloadId);
      setState("saved");
    } catch (err) {
      setState("error");
      setAtDeviceLimit(err instanceof DeviceLimitError);
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
          {atDeviceLimit && (
            <>
              {" "}
              <Link
                href="/account/devices"
                style={{ color: "var(--color-primary)", fontWeight: 600 }}
              >
                Manage devices
              </Link>
            </>
          )}
        </span>
      )}
    </span>
  );
}
