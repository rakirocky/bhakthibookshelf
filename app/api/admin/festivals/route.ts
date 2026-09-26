import { NextResponse } from "next/server";

import { FestivalService } from "@/app/lib/services/festivalService";

// Admin → Festivals: add a festival date. (Admin-only via proxy.ts.)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const festival = await FestivalService.create({
      festivalKey: body.festivalKey,
      start: body.start,
      end: body.end,
    });
    return NextResponse.json({ success: true, festival });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to add the festival date.",
      },
      { status: 400 }
    );
  }
}
