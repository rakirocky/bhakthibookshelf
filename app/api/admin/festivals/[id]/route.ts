import { NextResponse } from "next/server";

import { FestivalService } from "@/app/lib/services/festivalService";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await FestivalService.delete(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Unable to delete the festival date." },
      { status: 500 }
    );
  }
}
