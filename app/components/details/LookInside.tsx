"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/app/lib/i18n/I18nProvider";

// Minimal shape of what we use from pdfjs (same as ReaderClient).
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

/**
 * "Look inside" — flips through a book's free sample like a real book:
 * two pages side by side on wide screens, one at a time on phones, with
 * a page-turn animation. The sample is the public samples/ PDF.
 */
export default function LookInside({
  title,
  sampleUrl,
}: {
  title: string;
  sampleUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useT();

  return (
    <>
      <button type="button" className="look-inside-btn" onClick={() => setOpen(true)}>
        <span aria-hidden="true">📖</span> {t("book.lookInside")}
      </button>
      {/* portalled to <body> so no transformed/animated ancestor can
          turn the full-screen overlay into a boxed one */}
      {open &&
        createPortal(
          <LookInsideViewer title={title} sampleUrl={sampleUrl} onClose={() => setOpen(false)} />,
          document.body
        )}
    </>
  );
}

function LookInsideViewer({
  title,
  sampleUrl,
  onClose,
}: {
  title: string;
  sampleUrl: string;
  onClose: () => void;
}) {
  const docRef = useRef<PdfDoc | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLCanvasElement>(null);
  const rightRef = useRef<HTMLCanvasElement>(null);
  const touchX = useRef<number | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // first page of the current view
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [spread, setSpread] = useState(false);

  // Two-page spread when there's room for it.
  useEffect(() => {
    const update = () => setSpread(window.innerWidth >= 900);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Load the sample once; lock page scroll while open.
  useEffect(() => {
    let cancelled = false;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";
        const doc = (await pdfjs.getDocument({ url: sampleUrl, isEvalSupported: false })
          .promise) as unknown as PdfDoc;
        if (cancelled) {
          void doc.destroy();
          return;
        }
        docRef.current = doc;
        setTotal(doc.numPages);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      document.body.style.overflow = prevOverflow;
      void docRef.current?.destroy();
      docRef.current = null;
    };
  }, [sampleUrl]);

  const step = spread ? 2 : 1;
  // In a spread, views start on odd pages (1–2, 3–4 …) — derived, so
  // switching layouts (phone ↔ wide) never lands mid-spread.
  const start = spread && page % 2 === 0 ? page - 1 : page;

  const renderInto = useCallback(
    async (canvas: HTMLCanvasElement | null, num: number, maxW: number, maxH: number) => {
      const doc = docRef.current;
      if (!doc || !canvas) return;
      if (num < 1 || num > doc.numPages) {
        canvas.width = 0;
        canvas.style.width = "0px";
        return;
      }
      const p = await doc.getPage(num);
      const base = p.getViewport({ scale: 1 });
      const scale = Math.min(maxW / base.width, maxH / base.height);
      const vp = p.getViewport({ scale });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = vp.width * dpr;
      canvas.height = vp.height * dpr;
      canvas.style.width = `${vp.width}px`;
      canvas.style.height = `${vp.height}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      await p.render({ canvasContext: ctx, viewport: vp }).promise;
    },
    []
  );

  useEffect(() => {
    if (status !== "ready") return;
    const stage = stageRef.current;
    const w = (stage?.clientWidth ?? 800) - 24;
    const h = (stage?.clientHeight ?? 600) - 24;
    const pageW = spread ? w / 2 : w;
    void renderInto(leftRef.current, start, pageW, h);
    if (spread) void renderInto(rightRef.current, start + 1, pageW, h);
  }, [status, start, spread, renderInto]);

  const canPrev = start > 1;
  const canNext = start + step <= total;

  const go = useCallback(
    (d: 1 | -1) => {
      if (d === 1 && !canNext) return;
      if (d === -1 && !canPrev) return;
      setDir(d === 1 ? "next" : "prev");
      setPage(Math.max(1, start + d * step));
    },
    [canNext, canPrev, step, start]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const last = Math.min(start + step - 1, total);
  const atEnd = status === "ready" && !canNext;

  return (
    <div className="look-inside" role="dialog" aria-modal="true" aria-label={`Look inside ${title}`}>
      <div className="look-inside__bar">
        <span className="look-inside__title">
          {title} <small>· Free sample</small>
        </span>
        <button type="button" className="look-inside__close" onClick={onClose} aria-label="Close preview">
          ✕
        </button>
      </div>

      <div
        ref={stageRef}
        className="look-inside__stage"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const start = touchX.current;
          touchX.current = null;
          if (start === null) return;
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
      >
        {status === "loading" && <p className="look-inside__msg">Opening preview…</p>}
        {status === "error" && (
          <p className="look-inside__msg">The preview couldn&apos;t be opened. Please try again later.</p>
        )}
        {status === "ready" && (
          <div key={`${start}-${dir}`} className={`look-inside__spread look-inside__spread--${dir}`}>
            <canvas ref={leftRef} className="look-inside__page" />
            {spread && <canvas ref={rightRef} className="look-inside__page" />}
          </div>
        )}
      </div>

      {status === "ready" && (
        <div className="look-inside__nav">
          <button type="button" onClick={() => go(-1)} disabled={!canPrev} aria-label="Previous page">
            ‹
          </button>
          <span>
            {atEnd ? "End of sample · " : ""}
            {last > start ? `Pages ${start}–${last}` : `Page ${start}`} of {total}
          </span>
          <button type="button" onClick={() => go(1)} disabled={!canNext} aria-label="Next page">
            ›
          </button>
        </div>
      )}
    </div>
  );
}
