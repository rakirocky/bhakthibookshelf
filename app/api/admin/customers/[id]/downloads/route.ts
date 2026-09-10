import { NextResponse } from "next/server";

import { getAdminSession } from "@/app/lib/auth/getAdminSession";
import {
  DownloadError,
  DownloadService,
} from "@/app/lib/services/downloadService";

/**
 * Admin view of a customer's offline downloads, and the refund/dispute
 * lever to pull one. Revoking sets book_downloads.revoked_at — the device
 * wipes its local copy on the next reconcile. It does NOT free-restore
 * later. (Guarded by proxy.ts for /api/admin/*; the session check here is
 * belt-and-braces.)
 */

async function requireAdmin() {
  return getAdminSession();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  const { id } = await params;

  const downloads = await DownloadService.adminListDownloads(Number(id));

  return NextResponse.json({ success: true, downloads });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const downloadId = Number(
    new URL(request.url).searchParams.get("downloadId")
  );

  if (!Number.isInteger(downloadId) || downloadId <= 0) {
    return NextResponse.json(
      { success: false, message: "downloadId is required." },
      { status: 400 }
    );
  }

  try {
    await DownloadService.adminRevokeDownload(Number(id), downloadId);

    console.log(
      `[admin] revoked download ${downloadId} for customer ${id}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof DownloadError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    console.error(error);

    return NextResponse.json(
      { success: false, message: "Unable to revoke download." },
      { status: 500 }
    );
  }
}
