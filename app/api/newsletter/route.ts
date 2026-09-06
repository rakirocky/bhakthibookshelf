import { NextResponse } from "next/server";

import { NewsletterRepository } from "@/app/lib/repositories/newsletterRepository";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const cleanEmail = String(email ?? "").trim().toLowerCase();

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid email address.",
        },
        { status: 400 }
      );
    }

    await NewsletterRepository.subscribe(cleanEmail);

    console.log(`[newsletter] subscribed: ${cleanEmail}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to subscribe. Please try again.",
      },
      { status: 500 }
    );
  }
}
