"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { LocalBook, openBook } from "@/app/lib/offline/library";
import {
  ReaderTheme,
  ZOOM_STEPS,
  getProgress,
  getReaderPrefs,
  saveProgress,
  saveReaderPrefs,
  toggleBookmark,
} from "@/app/lib/offline/readingProgress";
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
  const [tabHidden, setTabHidden] = useState(false);

  // Reading comfort (readingProgress.ts): theme, zoom, bookmarks, resume.
  const [theme, setTheme] = useState<ReaderTheme>("day");
  const [zoom, setZoom] = useState(1);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [panel, setPanel] = useState<"none" | "look" | "marks">("none");
  const [notice, setNotice] = useState("");
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const renderPage = useCallback(async (num: number, zoomLevel: number) => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;

    const pdfPage = await doc.getPage(num);
    const stageWidth = Math.min(
      canvas.parentElement?.clientWidth ?? 900,
      1100
    );
    const base = pdfPage.getViewport({ scale: 1 });
    const scale = ((stageWidth - 28) / base.width) * zoomLevel;
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

        // Pick up where the reader left off, with their look.
        const [saved, look] = await Promise.all([
          getProgress(downloadId),
          getReaderPrefs(),
        ]);
        if (cancelled) return;
        setTheme(look.theme);
        setZoom(look.zoom);
        if (saved) {
          setBookmarks(saved.bookmarks);
          if (saved.page > 1 && saved.page <= doc.numPages) {
            setPage(saved.page);
            setNotice(`Continuing from page ${saved.page}`);
          }
        }

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

  // Render whenever the page or zoom changes and the doc is ready.
  useEffect(() => {
    if (status !== "ready") return;
    void renderPage(page, zoom);
  }, [status, page, zoom, renderPage]);

  // Remember the page for "Continue reading".
  useEffect(() => {
    if (status !== "ready" || total === 0) return;
    void saveProgress(downloadId, page, total);
  }, [status, page, total, downloadId]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 2600);
    return () => clearTimeout(t);
  }, [notice]);

  const goTo = useCallback(
    (n: number) => setPage(Math.min(Math.max(1, n), total || 1)),
    [total]
  );

  // Arrow keys turn pages on a computer.
  useEffect(() => {
    if (status !== "ready") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(page + 1);
      if (e.key === "ArrowLeft") goTo(page - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [status, page, goTo]);

  function updateLook(next: { theme?: ReaderTheme; zoom?: number }) {
    const look = { theme: next.theme ?? theme, zoom: next.zoom ?? zoom };
    setTheme(look.theme);
    setZoom(look.zoom);
    void saveReaderPrefs(look);
  }

  function stepZoom(dir: 1 | -1) {
    const i = ZOOM_STEPS.indexOf(zoom);
    const next = ZOOM_STEPS[Math.min(Math.max(0, i + dir), ZOOM_STEPS.length - 1)];
    updateLook({ zoom: next });
  }

  async function onBookmark() {
    const marks = await toggleBookmark(downloadId, page, total);
    setBookmarks(marks);
    setNotice(marks.includes(page) ? `Page ${page} bookmarked` : "Bookmark removed");
  }

  // Swipe left/right to turn pages (only at normal zoom — when zoomed in,
  // a sideways swipe is panning the page).
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || zoom !== 1) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      goTo(dx < 0 ? page + 1 : page - 1);
    }
  }

  const bookmarked = bookmarks.includes(page);

  // Browsers have no equivalent of Android's FLAG_SECURE — none of this
  // actually blocks a screenshot (OS-level tools and a second camera both
  // bypass it entirely). It's the same "deterrent, not a block" posture
  // already accepted for iOS: raise the friction, keep the page watermark
  // as the real traceability measure. Long-press / right-click "save
  // image", the print dialog, "save page as", and the devtools shortcuts
  // are the paths worth closing off.
  useEffect(() => {
    const blockContextMenu = (e: Event) => e.preventDefault();

    const blockShortcuts = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;

      if (
        key === "f12" ||
        (mod && key === "p") || // print
        (mod && key === "s") || // save page
        (mod && key === "u") || // view source
        (mod && e.shiftKey && ["i", "j", "c"].includes(key)) // devtools panes
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockShortcuts);
    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockShortcuts);
    };
  }, []);

  // Blank the page while the tab is hidden (switched away, minimized) —
  // trips up casual screen-recording/casting tools that rely on the tab
  // staying visible, and keeps the page out of OS task-switcher previews.
  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div
      className={`reader reader--${theme}`}
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      <div className="reader__bar">
        <button type="button" onClick={() => router.back()}>
          ‹ Close
        </button>
        <span className="reader__title">{title}</span>
        {status === "ready" && (
          <span className="reader__tools">
            <button
              type="button"
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark this page"}
              aria-pressed={bookmarked}
              className={bookmarked ? "is-on" : undefined}
              onClick={onBookmark}
            >
              {bookmarked ? "★" : "☆"}
            </button>
            <button
              type="button"
              aria-label="Bookmarks"
              aria-expanded={panel === "marks"}
              onClick={() => setPanel(panel === "marks" ? "none" : "marks")}
            >
              ☰
            </button>
            <button
              type="button"
              aria-label="Reading options"
              aria-expanded={panel === "look"}
              onClick={() => setPanel(panel === "look" ? "none" : "look")}
            >
              Aa
            </button>
          </span>
        )}
      </div>

      {status === "ready" && total > 0 && (
        <div className="reader__progress" aria-hidden="true">
          <span style={{ width: `${(page / total) * 100}%` }} />
        </div>
      )}

      {panel === "look" && (
        <div className="reader__panel" role="dialog" aria-label="Reading options">
          <div className="reader__panel-row">
            {(["day", "sepia", "night"] as ReaderTheme[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`reader__swatch reader__swatch--${t}${theme === t ? " is-on" : ""}`}
                aria-pressed={theme === t}
                onClick={() => updateLook({ theme: t })}
              >
                {t === "day" ? "Day" : t === "sepia" ? "Sepia" : "Night"}
              </button>
            ))}
          </div>
          <div className="reader__panel-row">
            <button type="button" onClick={() => stepZoom(-1)} disabled={zoom === ZOOM_STEPS[0]}>
              A−
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => stepZoom(1)}
              disabled={zoom === ZOOM_STEPS[ZOOM_STEPS.length - 1]}
            >
              A+
            </button>
          </div>
        </div>
      )}

      {panel === "marks" && (
        <div className="reader__panel" role="dialog" aria-label="Bookmarks">
          {bookmarks.length === 0 ? (
            <p style={{ margin: 0, opacity: 0.8 }}>
              No bookmarks yet — tap ☆ to mark a page.
            </p>
          ) : (
            <div className="reader__marks">
              {bookmarks.map((b) => (
                <button
                  key={b}
                  type="button"
                  className={b === page ? "is-on" : undefined}
                  onClick={() => {
                    goTo(b);
                    setPanel("none");
                  }}
                >
                  Page {b}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {notice && <div className="reader__toast" role="status">{notice}</div>}

      <div
        className="reader__stage"
        style={{ position: "relative" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => panel !== "none" && setPanel("none")}
      >
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
        {tabHidden && status === "ready" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--color-navy, #0a1a2f)",
            }}
          />
        )}
      </div>

      {status === "ready" && (
        <div className="reader__nav">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goTo(page - 1)}
          >
            ‹ Prev
          </button>
          <span>
            Page {page} of {total}
          </span>
          <button
            type="button"
            disabled={page >= total}
            onClick={() => goTo(page + 1)}
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
