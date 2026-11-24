import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { accountTokenFor } from "@/app/lib/services/googlePlayService";

// The app asks for this right before starting a Play purchase and passes
// it to Google as obfuscatedAccountId — see googlePlayService.
export async function GET() {
  const session = await getCustomerSession();

  if (!session) {
    return NextResponse.json(
      { success: false, code: "SESSION_EXPIRED", message: "Please sign in to buy." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    accountToken: accountTokenFor(session.customerId),
  });
}
