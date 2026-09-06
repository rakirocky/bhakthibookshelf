import { NextResponse } from "next/server";

import { ContactMessageService } from "@/app/lib/services/contactMessageService";

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

    await ContactMessageService.markRead(Number(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
