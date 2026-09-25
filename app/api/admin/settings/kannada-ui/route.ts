import { NextResponse } from "next/server";

import { SettingsService } from "@/app/lib/services/settingsService";

// Admin-only via proxy.ts's /api/admin matcher.
export async function PUT(request: Request) {
  try {
    const { enabled } = await request.json();

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { success: false, message: "enabled must be true or false." },
        { status: 400 }
      );
    }

    const kannadaUiEnabled =
      await SettingsService.setKannadaUiEnabled(enabled);

    return NextResponse.json({ success: true, kannadaUiEnabled });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Update failed",
      },
      { status: 500 }
    );
  }
}
