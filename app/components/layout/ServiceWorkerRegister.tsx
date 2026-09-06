"use client";

import { useEffect } from "react";

import { isNativeApp } from "@/app/lib/offline/native";

/**
 * Registers the offline service worker — only inside the app, so the
 * website keeps its normal no-SW behaviour and blast radius stays small.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!isNativeApp()) return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline reader just won't be available — not fatal */
    });
  }, []);

  return null;
}
