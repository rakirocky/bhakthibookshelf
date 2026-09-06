import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import {
  DownloadError,
  DownloadService,
} from "@/app/lib/services/downloadService";

/**
 * Register the current device for offline downloads, or list the
 * account's devices for the "Manage devices" screen.
 */

export async function GET() {
  const session = await getCustomerSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  const devices = await DownloadService.listDevices(
    session.customerId
  );

  return NextResponse.json({ success: true, devices });
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

    const { device, isNew } = await DownloadService.registerDevice({
      customerId: session.customerId,
      deviceId: body.deviceId,
      platform: body.platform,
      label: body.label,
    });

    return NextResponse.json({ success: true, device, isNew });
  } catch (error) {
    if (error instanceof DownloadError) {
      return NextResponse.json(
        { success: false, message: error.message, ...error.extra },
        { status: error.status }
      );
    }

    console.error(error);

    return NextResponse.json(
      { success: false, message: "Unable to register device." },
      { status: 500 }
    );
  }
}
