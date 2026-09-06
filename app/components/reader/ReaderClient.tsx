"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { LocalBook, openBook } from "@/app/lib/offline/library";
import { guardScreen, unguardScreen } from "@/app/lib/offline/screenGuard";

/**
 * Renders one decrypted book, a page at a time, onto a canvas. The
 * watermark is painted into the same canvas as the page — it is part of
 * the pixels, not a DOM node that can be deleted. Nothing is ever written
 * back to disk decrypted.
 */

// Minimal shape of what we use from pdfjs — avoids a type dep on the lib.
interface PdfDoc {
  numPages: number;
  getPage(n: number): Promise<PdfPage>;
  destroy(): Promise<void>;
}
interface PdfPage {
  getViewport(opts: { scale: number }): { width: number; height: number };
  render(opts: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }): { promise: Promise<void> };
}

export default function ReaderClient({
  downloadId,
}: {
  downloadId: number;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<PdfDoc | null>(null);
  const metaRef = useRef<LocalBook | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("Reading");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const renderPage = useCallback(async (num: number) => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;

    const pdfPage = await doc.getPage(num);
    const stageWidth = Math.min(
      canvas.parentElement?.clientWidth ?? 900,
      1100
    );
    const base = pdfPage.getViewport({ scale: 1 });
    const scale = (stageWidth - 28) / base.width;
    const viewport = pdfPage.getViewport({ scale: Math.max(scale, 0.2) });

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = viewport.width * dpr;
    canvas.height = viewport.height * dpr;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    await pdfPage.render({ canvasContext: ctx, viewport }).promise;

    paintWatermark(ctx, viewport.width, viewport.height, metaRef.current);
  }, []);

  // Load the book once.
  useEffect(() => {
    let cancelled = false;
    void guardScreen();

    (async () => {
      try {
        const { bytes, meta } = await openBook(downloadId);
        if (cancelled) return;
        metaRef.current = meta;
        setTitle(meta.title || "Reading");

        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";

        const doc = (await pdfjs.getDocument({
          data: new Uint8Array(bytes),
          isEvalSupported: false,
        }).promise) as unknown as PdfDoc;

        if (cancelled) {
          void doc.destroy();
          return;
        }

        docRef.current = doc;
        setTotal(doc.numPages);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setMessage(
          err instanceof Error ? err.message : "Could not open this book."
        );
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      void unguardScreen();
      void docRef.current?.destroy();
      docRef.current = null;
    };
  }, [downloadId]);

  // Render whenever the page changes and the doc is ready.
  useEffect(() => {
    if (status !== "ready") return;
    void renderPage(page);
  }, [status, page, renderPage]);

  // Block the long-press / right-click "save image" path.
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  return (
    <div className="reader">
      <div className="reader__bar">
        <button type="button" onClick={() => router.back()}>
          ‹ Close
        </button>
        <span className="reader__title">{title}</span>
        <span style={{ minWidth: 54, textAlign: "right", opacity: 0.7 }}>
          {status === "ready" ? `${page}/${total}` : ""}
        </span>
      </div>

      <div className="reader__stage">
        {status === "loading" && (
          <p className="reader__msg">Opening book…</p>
        )}
        {status === "error" && (
          <p className="reader__msg">{message}</p>
        )}
        <canvas
          ref={canvasRef}
          className="reader__canvas"
          hidden={status !== "ready"}
        />
      </div>

      {status === "ready" && (
        <div className="reader__nav">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹ Prev
          </button>
          <span>
            Page {page} of {total}
          </span>
          <button
            type="button"
            disabled={page >= total}
            onClick={() => setPage((p) => Math.min(total, p + 1))}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}

function paintWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  meta: LocalBook | null
) {
  if (!meta) return;

  const line = [meta.watermark.email, meta.watermark.phone]
    .filter(Boolean)
    .join("  ·  ");
  if (!line) return;

  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "13px system-ui, -apple-system, sans-serif";
  ctx.translate(width / 2, height / 2);
  ctx.rotate((-28 * Math.PI) / 180);

  const stepX = 260;
  const stepY = 150;
  for (let y = -height; y < height; y += stepY) {
    for (let x = -width; x < width; x += stepX) {
      ctx.fillText(line, x, y);
    }
  }
  ctx.restore();
}
