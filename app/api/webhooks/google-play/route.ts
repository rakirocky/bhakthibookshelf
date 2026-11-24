import { NextResponse } from "next/server";

import {
  PLAY_PACKAGE,
  verifyPubSubPush,
} from "@/app/lib/services/googlePlayService";
import {
  processGooglePurchase,
  revokeGooglePurchase,
} from "@/app/lib/services/storePurchaseService";

// Google Play real-time developer notifications, delivered by a Pub/Sub
// push subscription (with authentication) to this URL. A backstop for
// purchases whose app-side verify never arrived (app closed, network
// dropped, a pending UPI payment that completed later), and the only
// way we hear about refunds.
//
// Reply 2xx once handled (or deliberately ignored); any other status
// makes Pub/Sub retry, which is what we want for transient errors.
export async function POST(request: Request) {
  if (!(await verifyPubSubPush(request.headers.get("authorization")))) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  let notification: any;
  try {
    const envelope = await request.json();
    const data = envelope?.message?.data;
    notification = JSON.parse(Buffer.from(String(data ?? ""), "base64").toString("utf8"));
  } catch {
    // Malformed — retrying won't help.
    return NextResponse.json({ success: true, ignored: "malformed" });
  }

  if (notification?.packageName && notification.packageName !== PLAY_PACKAGE) {
    return NextResponse.json({ success: true, ignored: "package" });
  }

  try {
    if (notification?.testNotification) {
      console.log("[google-play:rtdn] test notification received");
      return NextResponse.json({ success: true });
    }

    const oneTime = notification?.oneTimeProductNotification;
    if (oneTime) {
      // 1 = ONE_TIME_PRODUCT_PURCHASED, 2 = ONE_TIME_PRODUCT_CANCELED
      if (oneTime.notificationType === 1) {
        const result = await processGooglePurchase({
          productId: String(oneTime.sku ?? ""),
          purchaseToken: String(oneTime.purchaseToken ?? ""),
          sessionCustomerId: null,
          source: "rtdn",
        });
        console.log(`[google-play:rtdn] purchase ${oneTime.sku}: ${result.status}`);
      } else {
        console.log(`[google-play:rtdn] one-time notification type ${oneTime.notificationType} for ${oneTime.sku}`);
      }
      return NextResponse.json({ success: true });
    }

    const voided = notification?.voidedPurchaseNotification;
    if (voided?.purchaseToken) {
      await revokeGooglePurchase(
        String(voided.purchaseToken),
        `voided, refundType ${voided.refundType ?? "?"}`
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, ignored: "type" });
  } catch (error) {
    console.error("[google-play:rtdn] error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
