import { NextResponse } from "next/server";

import { AnnouncementService } from "@/app/lib/services/announcementService";

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    await AnnouncementService.delete(Number(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete announcement.",
      },
      { status: 500 }
    );
  }
}
