"use client";

import { useSyncExternalStore } from "react";

import { isNativeApp } from "./native";

/**
 * True inside the Android app while in-app buying is switched off (the
 * default — see AppCommerceToggle). The root layout marks
 * <html data-app-commerce> when the admin has switched buying on.
 */
export function isReadOnlyApp(): boolean {
  if (!isNativeApp()) return false;
  return !document.documentElement.hasAttribute("data-app-commerce");
}

const subscribe = () => () => {};

/** Hook form; always false on the server and during hydration. */
export function useIsReadOnlyApp(): boolean {
  return useSyncExternalStore(subscribe, isReadOnlyApp, () => false);
}
