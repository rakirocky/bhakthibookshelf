import { NextResponse } from "next/server";

import { PasswordResetOtpService } from "@/app/lib/services/passwordResetOtpService";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required." },
        { status: 400 }
      );
    }

    await PasswordResetOtpService.requestReset(
      String(phone).trim()
    );

    // Always the same response, whether or not an account exists —
    // never reveal which phone numbers are registered.
    return NextResponse.json({
      success: true,
      message:
        "If an account exists for this number, we've sent a code to the registered email.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
