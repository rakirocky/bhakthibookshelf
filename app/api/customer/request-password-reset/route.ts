import { NextResponse } from "next/server";

import { CustomerRepository } from "@/app/lib/repositories/customerRepository";
import { PasswordResetRequestRepository } from "@/app/lib/repositories/passwordResetRequestRepository";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    const cleanPhone = String(phone ?? "").trim();

    if (!cleanPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter your phone number.",
        },
        { status: 400 }
      );
    }

    const customer = await CustomerRepository.getByPhone(
      cleanPhone
    );

    // Always return success, whether or not the phone matches an account —
    // otherwise this endpoint becomes a way to check which phone numbers
    // are registered, which is its own small privacy leak.
    if (customer) {
      await PasswordResetRequestRepository.create(
        cleanPhone
      );

      console.log(
        `[password-reset-request] queued for ${cleanPhone}`
      );
    } else {
      console.log(
        `[password-reset-request] ignored — no account for ${cleanPhone}`
      );
    }

    return NextResponse.json({ success: true });
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
