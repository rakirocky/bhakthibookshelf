import "server-only";

import fs from "fs/promises";
import path from "path";

/**
 * Reads the bytes for a stored asset (cover, sample, full PDF). `stored`
 * is whatever sits in the DB column — see app/lib/upload/fileUrl.ts:
 *
 *  - "storage/ebooks/xxx.pdf"  — admin upload, relative to the project root
 *    (storage/ lives outside public/)
 *  - "/images/books/gita.jpg"  — old seed data, relative to public/
 *  - "https://…"               — absolute URL
 *
 * The `path.join` calls carry a `turbopackIgnore` comment: without it the
 * dynamic second argument makes the file tracer pull the whole project
 * into every route that reads a book (the "Encountered unexpected file in
 * NFT list" build warning).
 */
export class StorageFileError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "StorageFileError";
    this.status = status;
  }
}

export async function readStorageFile(stored: string): Promise<Buffer> {
  if (stored.startsWith("http://") || stored.startsWith("https://")) {
    const res = await fetch(stored);

    if (!res.ok) {
      throw new StorageFileError("File could not be read.", 502);
    }

    return Buffer.from(await res.arrayBuffer());
  }

  // Reject anything that could climb out of the intended root.
  if (stored.includes("..") || stored.includes("\0")) {
    throw new StorageFileError("Invalid file path.", 400);
  }

  const fromPublic = stored.startsWith("/");
  const root = fromPublic
    ? path.join(/*turbopackIgnore: true*/ process.cwd(), "public")
    : process.cwd();
  const rel = fromPublic ? stored.slice(1) : stored;

  const filePath = path.join(/*turbopackIgnore: true*/ root, rel);

  if (!filePath.startsWith(root + path.sep)) {
    throw new StorageFileError("Invalid file path.", 400);
  }

  try {
    return await fs.readFile(filePath);
  } catch {
    throw new StorageFileError("File not found on server.", 404);
  }
}
