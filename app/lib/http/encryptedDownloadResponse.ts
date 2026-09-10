import "server-only";

import { NextResponse } from "next/server";

import type { DownloadPayload } from "../services/downloadService";

/**
 * The wire format for both `POST /api/customer/downloads` (first download)
 * and `POST /api/customer/downloads/[id]/restore` (re-install restore):
 * the encrypted book is the body, the key / iv / tag and watermark ride
 * in headers so the app moves the key straight into the keystore without
 * it landing in a JSON blob on disk. `app/lib/offline/library.ts` parses
 * exactly these headers.
 */
export function encryptedDownloadResponse(
  payload: DownloadPayload
): NextResponse {
  const { encrypted } = payload;

  const headers = new Headers({
    "Content-Type": "application/octet-stream",
    "Cache-Control": "no-store",
    "X-Download-Id": String(payload.downloadId),
    "X-Book-Id": String(payload.book.id),
    "X-Book-Title": encodeURIComponent(payload.book.title),
    "X-Book-Author": encodeURIComponent(payload.book.author),
    "X-Content-Key": encrypted.key.toString("base64"),
    "X-Content-Iv": encrypted.iv.toString("base64"),
    "X-Content-Tag": encrypted.authTag.toString("base64"),
    "X-Watermark-Email": encodeURIComponent(
      payload.watermark.email ?? ""
    ),
    "X-Watermark-Phone": encodeURIComponent(payload.watermark.phone),
  });

  return new NextResponse(new Uint8Array(encrypted.ciphertext), {
    status: 200,
    headers,
  });
}
