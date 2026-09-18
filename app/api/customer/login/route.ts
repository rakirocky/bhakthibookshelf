import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { CustomerRepository } from "@/app/lib/repositories/customerRepository";
import { LoginRateLimitService } from "@/app/lib/services/loginRateLimitService";
import { PromoterService } from "@/app/lib/services/promoterService";
import {
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_MAX_AGE,
  signCustomerSession,
} from "@/app/lib/auth/customerSession";

export async function POST(request: Request) {
  try {
    const { phone, password, referralCode } =
      await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Phone number and password are required.",
        },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).trim();

    const lockout = await LoginRateLimitService.checkLockout(
      cleanPhone,
      "customer"
    );

    if (lockout.locked) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many failed attempts. Try again in ${lockout.retryAfterMinutes} minute${lockout.retryAfterMinutes === 1 ? "" : "s"}.`,
        },
        { status: 429 }
      );
    }

    const customer = await CustomerRepository.getByPhone(
      cleanPhone
    );

    const invalidCredentials = NextResponse.json(
      {
        success: false,
        message: "Invalid phone number or password.",
      },
      { status: 401 }
    );

    if (!customer || !customer.is_active) {
      console.log(
        `[customer login] failed — no active account for phone ${phone}`
      );

      await LoginRateLimitService.recordFailure(
        cleanPhone,
        "customer"
      );

      return invalidCredentials;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      customer.password_hash
    );

    if (!passwordMatches) {
      console.log(
        `[customer login] failed — wrong password for phone ${phone}`
      );

      await LoginRateLimitService.recordFailure(
        cleanPhone,
        "customer"
      );

      return invalidCredentials;
    }

    console.log(
      `[customer login] success — customer #${customer.id} (${customer.phone})`
    );

    await LoginRateLimitService.recordSuccess(
      cleanPhone,
      "customer"
    );

    const token = await signCustomerSession({
      customerId: customer.id,
      phone: customer.phone,
      name: customer.name,
    });

    // Attribute this account to a promoter if a referral code is
    // available — whatever the customer typed on the login form takes
    // priority, falling back to the ?ref= cookie so a link click alone
    // (no typed code) still attributes on next login. No-ops once an
    // account is already attributed — see PromoterService for why.
    const cookieStore = await cookies();
    const referral = await PromoterService.attributeCustomerReferral(
      customer.id,
      referralCode || cookieStore.get("promoter_ref")?.value
    );

    const response = NextResponse.json({
      success: true,
      referral,
    });

    response.cookies.set(
      CUSTOMER_SESSION_COOKIE,
      token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: CUSTOMER_SESSION_MAX_AGE,
      }
    );

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Login failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
