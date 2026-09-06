import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from "@/app/lib/auth/session";

import {
  CUSTOMER_SESSION_COOKIE,
  verifyCustomerSession,
} from "@/app/lib/auth/customerSession";

// Paths that must stay reachable without a session — otherwise nobody
// could ever log in, or the login page itself would redirect to itself.
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/api/admin/login",
];

const PUBLIC_CUSTOMER_PATHS = [
  "/account/login",
  "/account/signup",
  "/account/forgot-password",
  "/account/required",
  "/api/customer/login",
  "/api/customer/signup",
  "/api/customer/request-password-reset",
  "/api/customer/forgot-password",
];

async function handleAdminArea(
  request: NextRequest,
  pathname: string
) {
  if (
    PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))
  ) {
    const response = NextResponse.next();
    captureReferralCode(request, response);
    return response;
  }

  const token = request.cookies.get(
    ADMIN_SESSION_COOKIE
  )?.value;

  const session = token
    ? await verifyAdminSession(token)
    : null;

  if (session) {
    const response = NextResponse.next();
    captureReferralCode(request, response);
    return response;
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", pathname);

  const response = NextResponse.redirect(loginUrl);
  captureReferralCode(request, response);
  return response;
}

async function handleCustomerArea(
  request: NextRequest,
  pathname: string
) {
  if (
    PUBLIC_CUSTOMER_PATHS.some((path) =>
      pathname.startsWith(path)
    )
  ) {
    const response = NextResponse.next();
    captureReferralCode(request, response);
    return response;
  }

  const token = request.cookies.get(
    CUSTOMER_SESSION_COOKIE
  )?.value;

  const session = token
    ? await verifyCustomerSession(token)
    : null;

  if (session) {
    const response = NextResponse.next();
    captureReferralCode(request, response);
    return response;
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/account/required", request.url);
  loginUrl.searchParams.set("from", pathname);

  const response = NextResponse.redirect(loginUrl);
  captureReferralCode(request, response);
  return response;
}

const REFERRAL_COOKIE = "promoter_ref";
const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const REFERRAL_CODE_PATTERN = /^[a-z0-9-]{3,50}$/;

function captureReferralCode(
  request: NextRequest,
  response: NextResponse
) {
  const ref = request.nextUrl.searchParams
    .get("ref")
    ?.toLowerCase();

  // Deliberately no DB lookup here — middleware runs on the Edge runtime,
  // which can't use the `pg` driver. We just store whatever looks like a
  // plausible code; it gets validated against real, active promoters at
  // order-creation time (Node runtime, in the orders API route). A fake
  // or stale code just means no promoter gets credited — harmless.
  if (ref && REFERRAL_CODE_PATTERN.test(ref)) {
    console.log(
      `[middleware] captured referral code "${ref}" on ${request.nextUrl.pathname}`
    );

    response.cookies.set(REFERRAL_COOKIE, ref, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: REFERRAL_COOKIE_MAX_AGE,
    });
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(
    `[access] ${request.method} ${pathname}${request.nextUrl.search}`
  );

  const isAdminArea =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin");

  if (isAdminArea) {
    return handleAdminArea(request, pathname);
  }

  const isCustomerArea =
    pathname.startsWith("/account") ||
    pathname.startsWith("/api/customer") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/api/orders");

  if (isCustomerArea) {
    return handleCustomerArea(request, pathname);
  }

  const response = NextResponse.next();

  captureReferralCode(request, response);

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/account/:path*",
    "/api/customer/:path*",
    "/((?!_next/static|_next/image|favicon.ico|api/storage).*)",
  ],
};
