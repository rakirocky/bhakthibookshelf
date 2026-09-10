import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { encryptedDownloadResponse } from "@/app/lib/http/encryptedDownloadResponse";
import {
  DownloadError,
  DownloadService,
} from "@/app/lib/services/downloadService";

/**
 * Re-issue a download the customer already holds a licence for — a
 * re-installed / wiped device rebuilding its offline library. Body:
 * { deviceId }. Response is byte-for-byte the same shape as
 * `POST /api/customer/downloads` (encrypted body + key/watermark headers).
 *
 * No entitlement re-check here: the existing book_downloads row is the
 * licence of record, so a book unlocked by a since-lapsed subscription
 * still restores (see docs/downloads-drm-design.md §4).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCustomerSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));

    const payload = await DownloadService.restoreDownload({
      customerId: session.customerId,
      deviceId: body.deviceId,
      downloadId: Number(id),
    });

    console.log(
      `[download] restored — customer ${session.phone} re-fetched book ` +
        `${payload.book.id} (${payload.book.title})`
    );

    return encryptedDownloadResponse(payload);
  } catch (error) {
    if (error instanceof DownloadError) {
      return NextResponse.json(
        { success: false, message: error.message, ...error.extra },
        { status: error.status }
      );
    }

    console.error(error);

    return NextResponse.json(
      { success: false, message: "Unable to restore download." },
      { status: 500 }
    );
  }
}
