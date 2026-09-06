import { NextResponse } from "next/server";

import { PromoterService } from "@/app/lib/services/promoterService";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const { is_active } = await request.json();

    const updated = await PromoterService.setActive(
      Number(id),
      Boolean(is_active)
    );

    return NextResponse.json({
      success: true,
      promoter: updated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update promoter.",
      },
      { status: 400 }
    );
  }
}
