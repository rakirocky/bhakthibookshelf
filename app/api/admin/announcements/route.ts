import { NextResponse } from "next/server";

import { AnnouncementService } from "@/app/lib/services/announcementService";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const announcement = await AnnouncementService.create(
      body
    );

    return NextResponse.json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create announcement.",
      },
      { status: 400 }
    );
  }
}
