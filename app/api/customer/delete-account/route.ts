import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { CUSTOMER_SESSION_COOKIE } from "@/app/lib/auth/customerSession";
import { CustomerRepository } from "@/app/lib/repositories/customerRepository";

// Self-service account deletion — required by the App Store (5.1.1(v))
// and Google Play. The customer re-enters their password so a phone left
// unlocked can't be used to wipe the account. See
// CustomerRepository.deleteAccount for exactly what is removed and kept.
export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required." },
        { status: 400 }
      );
    }

    const customer = await CustomerRepository.getById(session.customerId);

    if (!customer || !customer.is_active) {
      return NextResponse.json(
        { success: false, message: "Account not found." },
        { status: 404 }
      );
    }

    if (!(await bcrypt.compare(String(password), customer.password_hash))) {
      console.log("[customer-delete-account] wrong password:", customer.id);

      return NextResponse.json(
        { success: false, message: "Password is incorrect." },
        { status: 401 }
      );
    }

    await CustomerRepository.deleteAccount(customer.id);

    console.log("[customer-delete-account] account deleted:", customer.id);

    const response = NextResponse.json({ success: true });

    response.cookies.set(CUSTOMER_SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Unable to delete account." },
      { status: 500 }
    );
  }
}
