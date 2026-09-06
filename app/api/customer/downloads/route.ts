import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import {
  DownloadError,
  DownloadService,
} from "@/app/lib/services/downloadService";

/**
 * POST — request a book for this device. Returns the encrypted file as
 * the response body; the key, iv, auth tag and watermark fields ride in
 * headers so the app can move the key straight into the keystore without
 * it ever landing in a JSON blob on disk.
 *
 * GET  — list what a device is licensed to hold (?deviceId=...), used to
 * reconcile the local library after a re-login or re-install.
 */

export async function GET(request: Request) {
  const session = await getCustomerSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  const deviceId =
    new URL(request.url).searchParams.get("deviceId") ?? "";

  const result = await DownloadService.listDownloads(
    session.customerId,
    deviceId
  );

  return NextResponse.json({ success: true, ...result });
}

export async function POST(request: Request) {
  const session = await getCustomerSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));

    const payload = await DownloadService.requestDownload({
      customerId: session.customerId,
      deviceId: body.deviceId,
      bookId: Number(body.bookId),
    });

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
      "X-Watermark-Phone": encodeURIComponent(
        payload.watermark.phone
      ),
    });

    console.log(
      `[download] granted — customer ${session.phone} downloaded book ` +
        `${payload.book.id} (${payload.book.title}) to device`
    );

    return new NextResponse(new Uint8Array(encrypted.ciphertext), {
      status: 200,
      headers,
    });
  } catch (error) {
    if (error instanceof DownloadError) {
      return NextResponse.json(
        { success: false, message: error.message, ...error.extra },
        { status: error.status }
      );
    }

    console.error(error);

    return NextResponse.json(
      { success: false, message: "Unable to prepare download." },
      { status: 500 }
    );
  }
}
