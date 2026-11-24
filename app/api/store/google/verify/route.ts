import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { isGooglePlayConfigured } from "@/app/lib/services/googlePlayService";
import { processGooglePurchase } from "@/app/lib/services/storePurchaseService";
import {
  checkRequestRateLimit,
  getClientIp,
} from "@/app/lib/services/requestRateLimitService";

// Called by the Android app after Google's payment sheet reports a
// purchase, and on launch for any purchase not yet acknowledged (restore).
// The server re-checks everything with Google before granting.
export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, code: "SESSION_EXPIRED", message: "Please sign in again." },
        { status: 401 }
      );
    }

    const rateLimit = checkRequestRateLimit(
      `play-verify:${session.customerId}:${getClientIp(request)}`,
      { max: 30, windowMs: 5 * 60 * 1000 }
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many attempts. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    if (!isGooglePlayConfigured()) {
      console.error("[google-play] verify called but the service account is not configured");
      return NextResponse.json(
        { success: false, message: "In-app purchases are not set up yet." },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const productId = typeof body.productId === "string" ? body.productId : "";
    const purchaseToken = typeof body.purchaseToken === "string" ? body.purchaseToken : "";

    const result = await processGooglePurchase({
      productId,
      purchaseToken,
      sessionCustomerId: session.customerId,
      source: body.restore ? "restore" : "app",
    });

    if (result.status === "rejected") {
      return NextResponse.json(
        { success: false, message: result.reason },
        { status: result.httpStatus }
      );
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[google-play] verify error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "We couldn't confirm your purchase yet. It will appear in your library shortly — no need to pay again.",
      },
      { status: 500 }
    );
  }
}
