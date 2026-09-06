import { NextResponse } from "next/server";

import { ContactMessageService } from "@/app/lib/services/contactMessageService";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await ContactMessageService.submit(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to send your message.",
      },
      { status: 400 }
    );
  }
}
