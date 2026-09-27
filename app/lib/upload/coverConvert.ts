"use client";

/**
 * Admin cover upload helper (browser only). Clients often have their
 * cover art as a PDF, or in formats other than the jpg/png/webp the
 * server accepts (uploadTypes.ts → cover). Rather than widen what the
 * server stores and serves, the admin's browser turns whatever was
 * picked into a web-friendly image first:
 *
 * - PDF          → page 1 rendered to a JPEG
 * - jpg/png/webp → uploaded as-is, unless larger than the 5 MB limit
 *                  (then scaled down to a JPEG)
 * - other images (gif, bmp, avif, tiff, heic…) → re-encoded as JPEG,
 *                  if this browser can decode them
 */

const PASS_THROUGH = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;
// long edge of the stored cover — plenty for the largest cover display
const MAX_EDGE = 1800;

// Minimal shape of what we use from pdfjs (same as ReaderClient).
interface PdfPage {
  getViewport(o: { scale: number }): { width: number; height: number };
  render(o: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }): { promise: Promise<void> };
}
interface PdfDoc {
  getPage(n: number): Promise<PdfPage>;
  destroy(): Promise<void>;
}

export const COVER_ACCEPT = "image/*,application/pdf,.pdf,.heic,.heif,.tif,.tiff";

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function baseName(file: File): string {
  return file.name.replace(/\.[^.]+$/, "") || "cover";
}

function canvasToJpeg(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(new File([blob], `${name}.jpg`, { type: "image/jpeg" }))
          : reject(new Error("Could not convert the cover to an image.")),
      "image/jpeg",
      0.9
    );
  });
}

function whiteCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser can't prepare the cover image.");
  // JPEG has no transparency — give transparent PNG/GIF/PDF areas white
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

async function pdfFirstPage(file: File): Promise<File> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = (await pdfjs.getDocument({ data, isEvalSupported: false })
    .promise) as unknown as PdfDoc;

  try {
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const scale = MAX_EDGE / Math.max(base.width, base.height);
    const viewport = page.getViewport({ scale });
    const { canvas, ctx } = whiteCanvas(viewport.width, viewport.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    return await canvasToJpeg(canvas, baseName(file));
  } finally {
    void doc.destroy();
  }
}

async function reencodeImage(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "This browser can't read that image format. Please save the cover as JPG or PNG (or PDF) and try again."
    );
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const { canvas, ctx } = whiteCanvas(bitmap.width * scale, bitmap.height * scale);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvasToJpeg(canvas, baseName(file));
}

/** Turn any picked cover file into one the server accepts. */
export async function prepareCoverFile(file: File): Promise<File> {
  if (isPdf(file)) {
    return pdfFirstPage(file);
  }
  if (PASS_THROUGH.includes(file.type) && file.size <= MAX_BYTES) {
    return file;
  }
  return reencodeImage(file);
}
