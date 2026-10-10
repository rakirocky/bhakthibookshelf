"use client";

/**
 * Admin PDF upload check (browser only): warns when a book's pages are
 * low-resolution pictures, which look soft in the reader on phones and
 * when zoomed. Never blocks the upload — it's advice for the client.
 *
 * Background (2026-10-10): 111 of 113 uploaded books were picture-only
 * pages ~1024 px wide (AI-image size). The reader now draws at full
 * screen sharpness, so source resolution is the remaining limit.
 */

// Page pictures narrower than this get the warning. A phone page is
// ~1100 screen px wide at normal size; ~2000 px leaves room to zoom.
export const MIN_PAGE_PX = 1600;
export const RECOMMENDED_PAGE_PX = 2000;
// Pages sampled across the book (start, middle, end).
const SAMPLE_PAGES = 4;

interface ImageObj {
  width: number;
  height: number;
}
interface PdfPage {
  getViewport(o: { scale: number }): { width: number; height: number };
  getOperatorList(): Promise<{ fnArray: number[]; argsArray: unknown[][] }>;
  getTextContent(): Promise<{ items: unknown[] }>;
  objs: { get(name: string, cb: (o: ImageObj) => void): void };
  commonObjs: { get(name: string, cb: (o: ImageObj) => void): void };
  cleanup(): void;
}
interface PdfDoc {
  numPages: number;
  getPage(n: number): Promise<PdfPage>;
  destroy(): Promise<void>;
}

export type PdfResolution = {
  pages: number;
  /** Width in px of the narrowest page picture among sampled pages. */
  minImagePx: number | null;
  /** Sampled pages that are a picture rather than real text. */
  picturePages: number;
  sampled: number;
};

function samplePageNumbers(total: number): number[] {
  if (total <= SAMPLE_PAGES) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const picks = new Set<number>();
  for (let i = 0; i < SAMPLE_PAGES; i++) {
    picks.add(1 + Math.round((i * (total - 1)) / (SAMPLE_PAGES - 1)));
  }
  return [...picks];
}

/** Widest picture drawn on the page (px), or null if it has none. */
async function widestImage(
  page: PdfPage,
  ops: { paintImageXObject: number; paintImageXObjectRepeat: number }
): Promise<number | null> {
  const list = await page.getOperatorList();
  let widest: number | null = null;
  for (let i = 0; i < list.fnArray.length; i++) {
    const fn = list.fnArray[i];
    if (fn !== ops.paintImageXObject && fn !== ops.paintImageXObjectRepeat) {
      continue;
    }
    const name = list.argsArray[i][0] as string;
    const store = name.startsWith("g_") ? page.commonObjs : page.objs;
    const img = await new Promise<ImageObj | null>((resolve) => {
      try {
        store.get(name, (o) => resolve(o ?? null));
      } catch {
        resolve(null);
      }
    });
    if (img?.width) widest = Math.max(widest ?? 0, img.width);
  }
  return widest;
}

export async function measurePdfResolution(file: File): Promise<PdfResolution> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = (await pdfjs.getDocument({ data, isEvalSupported: false })
    .promise) as unknown as PdfDoc;

  try {
    let minImagePx: number | null = null;
    let picturePages = 0;
    const numbers = samplePageNumbers(doc.numPages);

    for (const n of numbers) {
      const page = await doc.getPage(n);
      const text = await page.getTextContent();
      // Real text is drawn crisp at any size — only picture pages matter.
      if (text.items.length < 5) {
        const px = await widestImage(page, pdfjs.OPS);
        if (px !== null) {
          picturePages++;
          minImagePx = minImagePx === null ? px : Math.min(minImagePx, px);
        }
      }
      page.cleanup();
    }

    return {
      pages: doc.numPages,
      minImagePx,
      picturePages,
      sampled: numbers.length,
    };
  } finally {
    void doc.destroy();
  }
}

/** The admin warning for this PDF, or null when it looks fine. */
export async function lowResolutionWarning(file: File): Promise<string | null> {
  const r = await measurePdfResolution(file);
  if (r.minImagePx === null || r.minImagePx >= MIN_PAGE_PX) return null;
  return (
    `Low resolution: the pages are pictures only about ${r.minImagePx} px wide, ` +
    `so they will look soft on phones, especially when readers zoom in. ` +
    `For sharp pages, export the book with pages at least ${RECOMMENDED_PAGE_PX} px wide ` +
    `(or as a print-quality A4 PDF) and upload it again. ` +
    `This upload still goes through.`
  );
}
