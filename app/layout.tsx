import type { Metadata, Viewport } from "next";
import { Marcellus, Noto_Sans, Noto_Sans_Kannada, Noto_Serif_Kannada } from "next/font/google";
import "./styles/globals.css";

import Providers from "./providers";
import Navbar from "./components/layout/Navbar";
import BottomNav from "./components/layout/BottomNav";
import AnnouncementBar from "./components/layout/AnnouncementBar";
import ServiceWorkerRegister from "./components/layout/ServiceWorkerRegister";
import ReconcileOnResume from "./components/offline/ReconcileOnResume";
import AppModeGuard from "./components/native/AppModeGuard";
import TempleFrame from "./components/layout/TempleFrame";
import { AnnouncementService } from "./lib/services/announcementService";
import { SettingsService } from "./lib/services/settingsService";
import { getUiLang } from "./lib/i18n/server";
import { I18nProvider } from "./lib/i18n/I18nProvider";

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
// The admin can switch in-app buying on (Settings → Android app): the
// server then marks <html data-app-commerce>, the script skips data-app,
// and client code (isReadOnlyApp) behaves like the website.
// Also always marks <html data-native> inside the app (buying on or off),
// e.g. for the lighter temple frame on small app screens.
const APP_MODE_SCRIPT = `try{var c=window.Capacitor;if(c&&c.isNativePlatform&&c.isNativePlatform()){var d=document.documentElement;d.setAttribute("data-native","");if(!d.hasAttribute("data-app-commerce"))d.setAttribute("data-app","")}}catch(e){}`;

// Site typography (self-hosted by next/font): Marcellus headings, Noto
// Sans body; the Kannada Noto faces are listed after them in each stack
// so Kannada text falls back to a matching, properly shaped font.
const headingFont = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-heading" });
const bodyFont = Noto_Sans({ subsets: ["latin"], variable: "--font-body" });
const bodyFontKn = Noto_Sans_Kannada({ subsets: ["kannada"], variable: "--font-body-kn" });
const headingFontKn = Noto_Serif_Kannada({ subsets: ["kannada"], weight: ["600"], variable: "--font-heading-kn" });
const fontVariables = [headingFont, bodyFont, bodyFontKn, headingFontKn]
  .map((f) => f.variable)
  .join(" ");

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const announcements =
    await AnnouncementService.getActive();

  const appCommerce = await SettingsService.isAppCommerceEnabled();
  const uiLang = await getUiLang();

  return (
    // suppressHydrationWarning: APP_MODE_SCRIPT sets data-app on <html>
    // before React hydrates, which React would otherwise flag.
    <html
      lang={uiLang}
      className={fontVariables}
      suppressHydrationWarning
      data-app-commerce={appCommerce ? "" : undefined}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: APP_MODE_SCRIPT }}
        />
      </head>
      <body>
        <I18nProvider lang={uiLang}>
        <Providers>
          <AnnouncementBar announcements={announcements} />
          <Navbar />
          <TempleFrame>{children}</TempleFrame>
          <BottomNav />
          <ServiceWorkerRegister />
          <ReconcileOnResume />
          <AppModeGuard />
        </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
