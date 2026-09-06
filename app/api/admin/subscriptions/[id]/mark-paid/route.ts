import { NextResponse } from "next/server";

import { SubscriptionService } from "@/app/lib/services/subscriptionService";

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

    const updated = await SubscriptionService.markPaid(
      Number(id)
    );

    return NextResponse.json({
      success: true,
      subscription: updated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update subscription.",
      },
      { status: 400 }
    );
  }
}
