"use client";

/**
 * Draws one PDF page onto a visible <canvas> as sharply as the screen
 * allows. Shared by the reader and the book page's "Look inside".
 *
 * Why this exists (client complaint 2026-10-10, "books look blurry"):
 * the books are picture pages ~1024 px wide (111 of 113 uploads). We
 * used to cap the canvas at 2× pixel density, so on a 3× phone every
 * page was drawn at 2/3 resolution and stretched — soft. Now:
 *
 * - full devicePixelRatio, times the pinch-zoom scale (re-rendered after
 *   a pinch so zooming in stays sharp), within a pixel budget so huge
 *   zooms can't exhaust a phone's memory;
 * - whole-pixel canvas sizes with a CSS size that maps 1:1 onto screen
 *   pixels (fractional sizes made the browser resample again);
 * - smooth, high-quality image scaling always on. pdf.js switches
 *   smoothing OFF (blocky nearest-neighbour) once a picture is enlarged
 *   past ~1.33× the screen density, which is exactly what zooming into
 *   a 1024 px page does;
 * - rendered off-screen and copied over in one step, so turning a page
 *   or re-rendering after a pinch never flashes a blank canvas.
 */

export interface PdfPageLike {
  getViewport(opts: { scale: number }): { width: number; height: number };
  render(opts: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
    transform?: number[];
  }): { promise: Promise<void>; cancel(): void };
}

// ~16.7 MP — the largest canvas iOS Safari will draw; plenty on Android.
const MAX_CANVAS_PIXELS = 16_777_216;
// Past this the page images (~1024 px) have no more detail to show.
const MAX_OUTPUT_SCALE = 8;

/** Thrown (and safe to ignore) when a newer render replaced this one. */
export class RenderSuperseded extends Error {}

/**
 * Renders `page` at `cssScale` (PDF points → CSS px) into `target`.
 * `zoomBoost` is the pinch-zoom factor (visualViewport.scale) on top of
 * the device pixel ratio. Pass the same `slot` object for one canvas so
 * a newer render cancels an older, still-running one.
 */
export async function renderPdfPage(
  page: PdfPageLike,
  target: HTMLCanvasElement,
  cssScale: number,
  slot: { task?: { cancel(): void } | null; seq?: number },
  zoomBoost = 1
): Promise<void> {
  const seq = (slot.seq ?? 0) + 1;
  slot.seq = seq;
  slot.task?.cancel();

  const viewport = page.getViewport({ scale: cssScale });
  const dpr = window.devicePixelRatio || 1;
  let outputScale = Math.min(dpr * Math.max(zoomBoost, 1), MAX_OUTPUT_SCALE);
  const pixels = viewport.width * viewport.height * outputScale * outputScale;
  if (pixels > MAX_CANVAS_PIXELS) {
    outputScale *= Math.sqrt(MAX_CANVAS_PIXELS / pixels);
  }

  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.round(viewport.width * outputScale));
  off.height = Math.max(1, Math.round(viewport.height * outputScale));
  // Exact ratio after rounding, so the page fills the canvas edge to edge.
  const sx = off.width / viewport.width;
  const sy = off.height / viewport.height;

  const ctx = off.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  // pdf.js assigns imageSmoothingEnabled per image (see doc comment);
  // an own no-op property keeps our "on" setting in force.
  Object.defineProperty(ctx, "imageSmoothingEnabled", {
    configurable: true,
    get: () => true,
    set: () => {},
  });

  const task = page.render({
    canvasContext: ctx,
    viewport,
    transform: [sx, 0, 0, sy, 0, 0],
  });
  slot.task = task;

  try {
    await task.promise;
  } catch (err) {
    if (slot.seq !== seq) throw new RenderSuperseded();
    throw err;
  } finally {
    if (slot.task === task) slot.task = null;
  }
  if (slot.seq !== seq) throw new RenderSuperseded();

  target.width = off.width;
  target.height = off.height;
  target.style.width = `${off.width / sx}px`;
  target.style.height = `${off.height / sy}px`;
  const out = target.getContext("2d");
  if (!out) return;
  out.drawImage(off, 0, 0);
  // Free the off-screen bitmap now rather than at GC (phones).
  off.width = 0;
  off.height = 0;
}
