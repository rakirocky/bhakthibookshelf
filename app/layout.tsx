import type { Metadata, Viewport } from "next";
import "./styles/globals.css";

import Providers from "./providers";
import Navbar from "./components/layout/Navbar";
import BottomNav from "./components/layout/BottomNav";
import AnnouncementBar from "./components/layout/AnnouncementBar";
import ServiceWorkerRegister from "./components/layout/ServiceWorkerRegister";
import ReconcileOnResume from "./components/offline/ReconcileOnResume";
import AppModeGuard from "./components/native/AppModeGuard";
import { AnnouncementService } from "./lib/services/announcementService";

// Update NEXT_PUBLIC_SITE_URL in your .env once the real domain is live —
// everything below (canonical URL, OG image URL) resolves against this.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Bhakthi Bookshelf | A Home for Devotional Reading",
  description:
    "Discover timeless wisdom through sacred scriptures, devotional books and spiritual literature.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Bhakthi Bookshelf | A Home for Devotional Reading",
    description:
      "Discover timeless wisdom through sacred scriptures, devotional books and spiritual literature.",
    url: siteUrl,
    siteName: "Bhakthi Bookshelf",
    images: [
      {
        url: "/images/logo.png",
        width: 818,
        height: 796,
        alt: "Bhakthi Bookshelf",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Bhakthi Bookshelf | A Home for Devotional Reading",
    description:
      "Discover timeless wisdom through sacred scriptures, devotional books and spiritual literature.",
    images: ["/images/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets content extend into the notch/status-bar and home-indicator
  // area rather than leaving a hard white bar there once this is
  // wrapped in a native app shell — paired with the safe-area CSS in
  // layout.css, which pads content back away from those exact zones.
  viewportFit: "cover",
  themeColor: "#0b1b3b",
};

// Announcements are live data read on every request — without this, a
// production build would freeze whatever was active at build time (see
// the same issue fixed earlier on /admin, /books, and the homepage).
export const dynamic = "force-dynamic";

// Inside the Play Store app the site is read-only: Google Play requires
// Play Billing for in-app digital purchases and forbids steering users to
// buy on the web, so the app never shows prices, cart, buy or subscribe.
// Capacitor injects its bridge ahead of page scripts, so this inline
// script can flag <html data-app> before first paint and CSS
// ([data-web-only], see layout.css) hides commerce UI with no flash.
const APP_MODE_SCRIPT = `try{if(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()){document.documentElement.setAttribute("data-app","")}}catch(e){}`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const announcements =
    await AnnouncementService.getActive();

  return (
    // suppressHydrationWarning: APP_MODE_SCRIPT sets data-app on <html>
    // before React hydrates, which React would otherwise flag.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: APP_MODE_SCRIPT }}
        />
      </head>
      <body>
        <Providers>
          <AnnouncementBar announcements={announcements} />
          <Navbar />
          {children}
          <BottomNav />
          <ServiceWorkerRegister />
          <ReconcileOnResume />
          <AppModeGuard />
        </Providers>
      </body>
    </html>
  );
}
