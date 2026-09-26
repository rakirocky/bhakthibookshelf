"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Google Analytics 4 for the public site (not the admin panel). The
 * measurement ID comes from the server at request time (GA_MEASUREMENT_ID
 * in .env.local), so it can be changed without a rebuild; without it
 * nothing loads. Page views on client-side navigation are tracked by
 * GA4's enhanced measurement ("page changes based on browser history").
 */
export default function Analytics({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (isAdmin) return;
    // tell web and Android-app visits apart in the reports
    const t = setTimeout(() => {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      gtag?.("set", "user_properties", {
        platform: document.documentElement.hasAttribute("data-app") ? "android-app" : "web",
      });
    }, 0);
    return () => clearTimeout(t);
  }, [isAdmin]);

  if (isAdmin) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
