"use client";

/**
 * Thin wrappers around Capacitor so the rest of the offline code doesn't
 * import plugin packages directly. Everything is dynamically imported:
 * on the website (no Capacitor) these calls simply report "not native"
 * and the offline UI stays hidden.
 */

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;

  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor;

  return Boolean(cap?.isNativePlatform?.());
}

export async function nativePlatform(): Promise<"android" | "ios" | "web"> {
  if (!isNativeApp()) return "web";
  const { Capacitor } = await import("@capacitor/core");
  const p = Capacitor.getPlatform();
  return p === "ios" ? "ios" : "android";
}
