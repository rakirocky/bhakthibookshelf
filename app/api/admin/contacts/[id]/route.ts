import { NextResponse } from "next/server";

import { MarketingContactRepository } from "@/app/lib/repositories/marketingContactRepository";

// Removes an imported (Excel/CSV) contact. Website/app accounts can't be
// removed from here — they leave the list when the customer deletes
// their account.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await MarketingContactRepository.deleteImported(Number(id));
    if (!ok) {
      return NextResponse.json({ success: false, message: "Contact not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to delete." }, { status: 500 });
  }
}
