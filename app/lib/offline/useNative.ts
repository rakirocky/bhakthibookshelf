"use client";

import { useSyncExternalStore } from "react";

import { isNativeApp } from "./native";

const subscribe = () => () => {};

/**
 * `true` only inside the Capacitor app. Uses useSyncExternalStore so the
 * server snapshot is always `false` (no hydration mismatch) and the
 * client reads the real value without a setState-in-effect.
 */
export function useIsNativeApp(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isNativeApp(),
    () => false
  );
}
