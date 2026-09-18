import bcrypt from "bcryptjs";
import crypto from "crypto";
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
    const { phone, password, referralCode, forceLogout } =
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

    // Credentials were genuinely correct here, so this counts toward
    // rate-limit "success" regardless of what happens next — the
    // single-active-session check below isn't a wrong-password case.
    await LoginRateLimitService.recordSuccess(
      cleanPhone,
      "customer"
    );

    // Single-active-session login (owner decision, 2026-09-19): reject
    // this login outright rather than silently kicking the other
    // device — see migration 024 for the reasoning. `forceLogout` is
    // the self-service escape hatch (added after the fact, same day):
    // the password was already verified correct above, so whoever's
    // making this request has already proven they're the account
    // owner — no extra re-authentication is needed to let them kick
    // their own other device out, same trust boundary as a normal
    // login. This only fires when the login form explicitly resends
    // the request with forceLogout after being shown the blocked
    // state — it's never silently implied by the client.
    const hasActiveSession =
      await CustomerRepository.hasActiveSession(customer.id);

    if (hasActiveSession && !forceLogout) {
      console.log(
        `[customer login] blocked — customer #${customer.id} already has an active session on another device`
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "This account is already signed in on another device.",
          reason: "session_active_elsewhere",
        },
        { status: 409 }
      );
    }

    if (hasActiveSession && forceLogout) {
      console.log(
        `[customer login] customer #${customer.id} signed out their other device to log in here`
      );
    }

    const sessionId = crypto.randomUUID();
    const sessionExpiresAt = new Date(
      Date.now() + CUSTOMER_SESSION_MAX_AGE * 1000
    );

    await CustomerRepository.setActiveSession(
      customer.id,
      sessionId,
      sessionExpiresAt
    );

    const token = await signCustomerSession({
      customerId: customer.id,
      phone: customer.phone,
      name: customer.name,
      sessionId,
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
