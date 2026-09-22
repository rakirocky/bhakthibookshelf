import { NextResponse } from "next/server";

import { NewsletterService } from "@/app/lib/services/newsletterService";

export async function POST(request: Request) {
  try {
    const { subject, message } = await request.json();

    const result = await NewsletterService.broadcast(subject, message);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to send newsletter.",
      },
      { status: 400 }
    );
  }
}
