import { NextResponse } from "next/server";

import { normalizePhone } from "@/app/lib/contacts/contactImport";
import { MarketingContactRepository } from "@/app/lib/repositories/marketingContactRepository";

// Record that a person agreed to messages ("yes", e.g. they replied YES)
// or asked to stop ("no"). Applies to the imported contact and the
// website/app account with that number.
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(body?.phone);
    const consent = body?.consent;
    if (!phone || (consent !== "yes" && consent !== "no")) {
      return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
    }
    const found = await MarketingContactRepository.setConsent(phone, consent);
    if (!found) {
      return NextResponse.json({ success: false, message: "Contact not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to update." }, { status: 500 });
  }
}
