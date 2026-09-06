import type { Metadata, Viewport } from "next";
import "./styles/globals.css";

import Providers from "./providers";
import Navbar from "./components/layout/Navbar";
import BottomNav from "./components/layout/BottomNav";
import AnnouncementBar from "./components/layout/AnnouncementBar";
import ServiceWorkerRegister from "./components/layout/ServiceWorkerRegister";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const announcements =
    await AnnouncementService.getActive();

  return (
    <html lang="en">
      <body>
        <Providers>
          <AnnouncementBar announcements={announcements} />
          <Navbar />
          {children}
          <BottomNav />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
