import { NextResponse } from "next/server";

import { PromoterService } from "@/app/lib/services/promoterService";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const promoter = await PromoterService.create(body);

    return NextResponse.json({
      success: true,
      promoter,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create promoter.",
      },
      { status: 400 }
    );
  }
}
