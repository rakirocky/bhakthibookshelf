import { NextResponse } from "next/server";

import { PasswordResetOtpService } from "@/app/lib/services/passwordResetOtpService";

export async function POST(request: Request) {
  try {
    const { phone, otp, newPassword } = await request.json();

    if (!phone || !otp || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone, code, and new password are all required.",
        },
        { status: 400 }
      );
    }

    await PasswordResetOtpService.verifyAndReset(
      String(phone).trim(),
      String(otp).trim(),
      String(newPassword)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to reset password.",
      },
      { status: 400 }
    );
  }
}
