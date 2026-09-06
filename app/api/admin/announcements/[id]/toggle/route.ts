import { NextResponse } from "next/server";

import { AnnouncementService } from "@/app/lib/services/announcementService";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const { isActive } = await request.json();

    const updated = await AnnouncementService.setActive(
      Number(id),
      Boolean(isActive)
    );

    return NextResponse.json({
      success: true,
      announcement: updated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update announcement.",
      },
      { status: 400 }
    );
  }
}
