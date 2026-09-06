import { NextResponse } from "next/server";

import { SettingsService } from "@/app/lib/services/settingsService";

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const updated = await SettingsService.updateSettings({
      store_name: body.store_name,
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
      address: body.address,
      gst_number: body.gst_number,
    });

    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Update failed",
      },
      {
        status: 400,
      }
    );
  }
}
