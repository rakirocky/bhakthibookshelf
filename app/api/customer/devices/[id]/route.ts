import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import {
  DownloadError,
  DownloadService,
} from "@/app/lib/services/downloadService";

/**
 * Deauthorize a device. Frees a download slot for the account; copies
 * already on that device are left in place.
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
    await DownloadService.revokeDevice(session.customerId, Number(id));

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
      { success: false, message: "Unable to remove device." },
      { status: 500 }
    );
  }
}
