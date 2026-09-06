import { NextResponse } from "next/server";

import { PasswordResetRequestRepository } from "@/app/lib/repositories/passwordResetRequestRepository";

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

    const updated =
      await PasswordResetRequestRepository.markResolved(
        Number(id)
      );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Request not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update request.",
      },
      { status: 500 }
    );
  }
}
