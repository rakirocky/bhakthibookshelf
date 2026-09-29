"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { isReadOnlyApp } from "@/app/lib/offline/appMode";
import { isIOSApp, isNativeApp } from "@/app/lib/offline/native";

// Purchase pages have nothing to offer in the read-only app (see
// APP_MODE_SCRIPT in app/layout.tsx), so a deep link or back-stack entry
// lands on the reader's own library instead.
const WEB_ONLY_ROUTES = ["/cart", "/checkout", "/subscribe", "/order-success"];

export default function AppModeGuard() {
  const pathname = usePathname();
  const router = useRouter();

  // Android hardware/gesture Back: go back a page, or close the app on the
  // first page. Needs the @capacitor/app plugin, which only APK 1.3+ has —
  // older installs keep their old behaviour (Back closes the app).
  useEffect(() => {
    if (!isNativeApp()) return;
    let cancelled = false;
    let remove: (() => void) | undefined;

    (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isPluginAvailable("App")) return;
      const { App } = await import("@capacitor/app");
      const handle = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) window.history.back();
        else App.exitApp();
      });
      if (cancelled) handle.remove();
      else remove = () => handle.remove();
    })().catch(() => {});

    return () => {
      cancelled = true;
      remove?.();
    };
  }, []);

  useEffect(() => {
    // Fallbacks in case the inline script ran before the bridge existed.
    if (isNativeApp()) {
      document.documentElement.setAttribute("data-native", "");
      if (isIOSApp()) {
        document.documentElement.setAttribute("data-ios", "");
      }
    }

    if (!isReadOnlyApp()) return;

    document.documentElement.setAttribute("data-app", "");

    if (
      WEB_ONLY_ROUTES.some(
        (r) => pathname === r || pathname?.startsWith(`${r}/`)
      )
    ) {
      router.replace("/downloads");
    }
  }, [pathname, router]);

  return null;
}
