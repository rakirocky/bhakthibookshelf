import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import {
  DownloadError,
  DownloadService,
} from "@/app/lib/services/downloadService";

/**
 * Remove a download — the reader deleting a book from their device, or
 * freeing a slot. The local encrypted copy is wiped by the app; this
 * clears the server-side license so it won't be restored on next sync.
 */
export async function DELETE(
  _request: Request,
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
    await DownloadService.removeDownload(session.customerId, Number(id));

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
      { success: false, message: "Unable to remove download." },
      { status: 500 }
    );
  }
}
