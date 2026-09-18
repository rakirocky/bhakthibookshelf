import { NextResponse } from "next/server";

import { CustomerRepository } from "@/app/lib/repositories/customerRepository";
import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { CUSTOMER_SESSION_COOKIE } from "@/app/lib/auth/customerSession";

export async function POST() {
  // Free up the single-active-session slot so this account can log in
  // elsewhere right away, instead of waiting out the full 30-day
  // session expiry. Best-effort — the cookie always gets cleared below
  // regardless of whether this succeeds.
  const session = await getCustomerSession();

  if (session) {
    await CustomerRepository.clearActiveSession(
      session.customerId,
      session.sessionId
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
