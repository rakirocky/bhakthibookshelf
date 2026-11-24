"use client";

import { useSyncExternalStore } from "react";

import { isIOSApp, isNativeApp } from "./native";
import { hasPlayBilling } from "../store/playBilling";

/**
 * True inside the Android app while in-app buying is switched off (the
 * default — see AppCommerceToggle). The root layout marks
 * <html data-app-commerce> when the admin has switched buying on.
 * The iOS app is always read-only: that switch is Android-only, and
 * Apple requires In-App Purchase for digital books.
 */
export function isReadOnlyApp(): boolean {
  if (!isNativeApp()) return false;
  if (isIOSApp()) return true;
  // Play Billing build: the website's own buying (cart, Razorpay) is off
  // — books are bought with PlayBuyButton instead (see isStoreApp).
  if (hasPlayBilling()) return true;
  return !document.documentElement.hasAttribute("data-app-commerce");
}

/** True in an app build that sells through the store (Play Billing). */
export function isStoreApp(): boolean {
  return hasPlayBilling();
}

/** Hook form; always false on the server and during hydration. */
export function useIsStoreApp(): boolean {
  return useSyncExternalStore(subscribe, isStoreApp, () => false);
}

const subscribe = () => () => {};

/** Hook form; always false on the server and during hydration. */
export function useIsReadOnlyApp(): boolean {
  return useSyncExternalStore(subscribe, isReadOnlyApp, () => false);
}
