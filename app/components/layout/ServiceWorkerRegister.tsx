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

    // The offline shell SW caches /_next/static cache-first. Against a
    // dev server that breaks HMR (stale chunks, renderer crashes), so
    // only run it on the production host; on any other origin, tear down
    // an SW + caches a previous build may have left behind.
    if (window.location.hostname !== "bhakthibookshelf.in") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      if (window.caches) {
        caches
          .keys()
          .then((keys) => keys.forEach((k) => caches.delete(k)))
          .catch(() => {});
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline reader just won't be available — not fatal */
    });
  }, []);

  return null;
}
