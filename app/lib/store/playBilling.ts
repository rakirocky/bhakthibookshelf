"use client";

/**
 * Google Play Billing from the website running inside the Android app.
 * The native side is android/.../PlayBillingPlugin.java (APK 1.9+);
 * older APKs don't have it, so they keep their previous behaviour.
 *
 * Flow: ask our server for this customer's account token → Google's
 * payment sheet → send the purchase token to our server, which checks it
 * with Google, unlocks the book and acknowledges the purchase.
 */

import type { PluginListenerHandle } from "@capacitor/core";

type PlayPurchase = {
  purchaseToken: string;
  orderId?: string;
  acknowledged: boolean;
  state: "purchased" | "pending" | "unknown";
  productIds: string[];
};

type PlayBillingPlugin = {
  isAvailable(): Promise<{ available: boolean }>;
  purchase(options: {
    productId: string;
    accountToken: string;
  }): Promise<{
    status: "purchased" | "pending" | "cancelled" | "already_owned";
    purchases: PlayPurchase[];
  }>;
  queryPurchases(): Promise<{ purchases: PlayPurchase[] }>;
  addListener(
    event: "purchasesUpdated",
    cb: (e: { purchases: PlayPurchase[] }) => void
  ): Promise<PluginListenerHandle>;
};

type CapGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  isPluginAvailable?: (name: string) => boolean;
};

/** True inside an Android app build that has Play Billing (sync). */
export function hasPlayBilling(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: CapGlobal }).Capacitor;
  return Boolean(
    cap?.isNativePlatform?.() &&
      cap.getPlatform?.() === "android" &&
      cap.isPluginAvailable?.("PlayBilling")
  );
}

// The plugin is a Proxy that forwards every property to native code, so
// it must never be the value a Promise resolves with (or an async
// function returns): the runtime would call `.then` on it, which Android
// rejects ("PlayBilling.then() is not implemented"). Always hand it out
// wrapped as { p } and call methods on `.p`.
let pluginPromise: Promise<{ p: PlayBillingPlugin }> | null = null;

function plugin(): Promise<{ p: PlayBillingPlugin }> {
  if (!hasPlayBilling()) {
    return Promise.reject(new StoreError("Google Play isn't available here."));
  }
  pluginPromise ??= import("@capacitor/core").then(({ registerPlugin }) => ({
    p: registerPlugin<PlayBillingPlugin>("PlayBilling"),
  }));
  return pluginPromise;
}

export class StoreError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
  }
}

export type BuyOutcome =
  | { status: "granted"; orderNumber?: string }
  | { status: "pending" }
  | { status: "cancelled" };

async function verify(
  productId: string,
  purchaseToken: string,
  restore = false
) {
  const res = await fetch("/api/store/google/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, purchaseToken, restore }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new StoreError(
      data.message ?? "We couldn't confirm your purchase.",
      data.code
    );
  }
  return data as
    | { status: "granted"; orderNumber?: string }
    | { status: "pending" };
}

/** Buys one product (book_<id> or plan_<id>) through Google Play. */
export async function buyWithPlay(productId: string): Promise<BuyOutcome> {
  const tokenRes = await fetch("/api/store/google/account", {
    cache: "no-store",
  });
  const tokenData = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || !tokenData.accountToken) {
    throw new StoreError(
      tokenData.message ?? "Please sign in again.",
      tokenData.code
    );
  }

  const billing = (await plugin()).p;
  let result;
  try {
    result = await billing.purchase({
      productId,
      accountToken: tokenData.accountToken,
    });
  } catch (error) {
    const e = error as { message?: string; code?: string };
    throw new StoreError(e.message ?? "Google Play purchase failed.", e.code);
  }

  if (result.status === "cancelled") return { status: "cancelled" };

  // Already owned on Google Play (e.g. bought before a reinstall, or the
  // first verify never reached us): restore it instead.
  const purchases =
    result.status === "already_owned"
      ? (await billing.queryPurchases()).purchases
      : result.purchases;

  const mine = purchases.find((p) => p.productIds.includes(productId));
  if (!mine) {
    return result.status === "pending" ? { status: "pending" } : { status: "cancelled" };
  }
  if (mine.state === "pending") return { status: "pending" };

  return verify(productId, mine.purchaseToken, result.status === "already_owned");
}

/**
 * Sends every Play purchase the server hasn't acknowledged yet (verify
 * never arrived, or a pending payment completed while the app was
 * closed). Returns how many were newly granted.
 */
export async function restorePlayPurchases(): Promise<number> {
  const billing = (await plugin()).p;
  const { purchases } = await billing.queryPurchases();
  let granted = 0;
  for (const p of purchases) {
    if (p.state !== "purchased" || p.acknowledged) continue;
    for (const productId of p.productIds) {
      try {
        const r = await verify(productId, p.purchaseToken, true);
        if (r.status === "granted") granted++;
      } catch (error) {
        console.warn("[play] restore failed for", productId, error);
      }
    }
  }
  return granted;
}

export async function onPlayPurchasesUpdated(
  cb: () => void
): Promise<() => void> {
  const billing = (await plugin()).p;
  const handle = await billing.addListener("purchasesUpdated", () => cb());
  return () => void handle.remove();
}
