"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { isReadOnlyApp } from "@/app/lib/offline/appMode";
import { isNativeApp } from "@/app/lib/offline/native";

// Purchase pages have nothing to offer in the read-only app (see
// APP_MODE_SCRIPT in app/layout.tsx), so a deep link or back-stack entry
// lands on the reader's own library instead.
const WEB_ONLY_ROUTES = ["/cart", "/checkout", "/subscribe", "/order-success"];

export default function AppModeGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Fallbacks in case the inline script ran before the bridge existed.
    if (isNativeApp()) {
      document.documentElement.setAttribute("data-native", "");
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
