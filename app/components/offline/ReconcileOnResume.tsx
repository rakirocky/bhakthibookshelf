"use client";

import { useEffect, useRef } from "react";

import { reconcileLibrary } from "@/app/lib/offline/library";
import { useIsNativeApp } from "@/app/lib/offline/useNative";

/**
 * Keeps the on-device offline library in step with the server: once on
 * launch, and again whenever the app returns to the foreground
 * (`visibilitychange` fires in the Capacitor WebView on resume). Renders
 * nothing. No-op on the website and while offline.
 *
 * This is what makes an admin-revoked book disappear from a device, and
 * what rebuilds the library after a reinstall + re-login.
 */
export default function ReconcileOnResume() {
  const native = useIsNativeApp();
  const running = useRef(false);

  useEffect(() => {
    if (!native) return;

    const run = () => {
      if (running.current) return;
      running.current = true;
      void reconcileLibrary().finally(() => {
        running.current = false;
      });
    };

    run();

    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };

    document.addEventListener("visibilitychange", onVisible);
    return () =>
      document.removeEventListener("visibilitychange", onVisible);
  }, [native]);

  return null;
}
