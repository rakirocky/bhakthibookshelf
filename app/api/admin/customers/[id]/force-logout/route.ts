import { NextResponse } from "next/server";

import { CustomerRepository } from "@/app/lib/repositories/customerRepository";

/**
 * Support lever for the single-active-session login limit (migration
 * 024): a customer who's lost access to their signed-in device (lost
 * phone, etc.) has no way to log out of it themselves and would
 * otherwise be locked out of their own account until that session's
 * natural 30-day expiry. This unconditionally frees the slot so they
 * can sign in elsewhere immediately.
 */
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

    await CustomerRepository.forceLogout(Number(id));

    console.log(
      `[admin] force-logout — cleared active session for customer ${id}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to sign this customer out.",
      },
      { status: 500 }
    );
  }
}
