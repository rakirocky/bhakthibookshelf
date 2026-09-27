"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

interface Announcement {
  id: number;
  message: string;
  link: string | null;
}

/**
 * Site-wide announcement bar (Admin → Announcements). No close button:
 * while any announcement is active its text scrolls continuously from
 * right to left, like a news ticker, until the admin deactivates it.
 * Several active announcements scroll one after another in the same
 * line. Pauses while hovered or focused so a link can be read and
 * clicked.
 */
export default function AnnouncementBar({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const pathname = usePathname();

  // Admin has its own header — no flash bar there, same reasoning as
  // hiding the storefront Navbar on /admin.
  if (pathname?.startsWith("/admin") || announcements.length === 0) {
    return null;
  }

  // Roughly constant reading speed whatever the text length: the track
  // is one bar-width of lead-in plus the text, so allow ~7 px per char.
  const chars = announcements.reduce((n, a) => n + a.message.length + 6, 0);
  const seconds = Math.max(14, Math.round(10 + chars * 0.14));

  return (
    <div className="announcement-bar" role="status">
      <div
        className="announcement-bar__track"
        style={{ "--marquee-duration": `${seconds}s` } as CSSProperties}
      >
        {announcements.map((a, i) => {
          const text = (
            <span className="announcement-bar__message">📢 {a.message}</span>
          );
          return (
            <span key={a.id} className="announcement-bar__item">
              {i > 0 && (
                <span className="announcement-bar__sep" aria-hidden="true">
                  ✦
                </span>
              )}
              {a.link ? (
                <Link href={a.link} className="announcement-bar__link">
                  {text}
                </Link>
              ) : (
                text
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
