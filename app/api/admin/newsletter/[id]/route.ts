import { NextResponse } from "next/server";

import { NewsletterRepository } from "@/app/lib/repositories/newsletterRepository";

// Unsubscribes rather than hard-deleting the row — see the comment on
// NewsletterRepository.deactivate for why.
export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const updated = await NewsletterRepository.deactivate(
      Number(id)
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Subscriber not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to unsubscribe.",
      },
      { status: 500 }
    );
  }
}
