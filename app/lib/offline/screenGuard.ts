"use client";

import { isNativeApp } from "./native";

/**
 * Screenshot / screen-recording protection, toggled around the reader.
 *
 * Android: FLAG_SECURE — screenshots and recording both fail, the app is
 * blank in recents and blocked from casting.
 * iOS: recording and mirroring show blank; a still screenshot can't be
 * blocked (platform limit) — the page watermark is the deterrent there.
 */

let active = 0;

export async function guardScreen(): Promise<void> {
  if (!isNativeApp()) return;
  active += 1;
  if (active > 1) return;
  try {
    const { PrivacyScreen } = await import(
      "@capacitor-community/privacy-screen"
    );
    await PrivacyScreen.enable();
  } catch {
    /* plugin missing on an old build — reader still works, unprotected */
  }
}

export async function unguardScreen(): Promise<void> {
  if (!isNativeApp()) return;
  active = Math.max(0, active - 1);
  if (active > 0) return;
  try {
    const { PrivacyScreen } = await import(
      "@capacitor-community/privacy-screen"
    );
    await PrivacyScreen.disable();
  } catch {
    /* ignore */
  }
}
