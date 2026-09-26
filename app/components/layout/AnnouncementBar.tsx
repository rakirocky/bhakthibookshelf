"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Announcement {
  id: number;
  message: string;
  link: string | null;
}

const POP_EVERY_MS = 5000;

/**
 * Site-wide announcement bar (Admin → Announcements). Always shown while
 * an announcement is active — no close button — and every 5 seconds the
 * message "pops" in again: the next announcement if there are several,
 * the same one re-animated if there's only one. Pauses while hovered or
 * focused so a message can be read and its link clicked.
 */
export default function AnnouncementBar({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const pathname = usePathname();

  // tick changes every 5 s; it picks the announcement and, as the
  // message's key, remounts it so the pop animation replays
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (announcements.length === 0 || paused) {
      return;
    }

    const timer = setInterval(() => setTick((t) => t + 1), POP_EVERY_MS);
    return () => clearInterval(timer);
  }, [announcements.length, paused]);

  // Admin has its own header — no flash bar there, same reasoning as
  // hiding the storefront Navbar on /admin.
  if (pathname?.startsWith("/admin") || announcements.length === 0) {
    return null;
  }

  const current = announcements[tick % announcements.length];

  const message = (
    <span key={tick} className="announcement-bar__message">
      📢 {current.message}
    </span>
  );

  return (
    <div
      className="announcement-bar"
      role="status"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {current.link ? (
        <Link href={current.link} className="announcement-bar__link">
          {message}
        </Link>
      ) : (
        message
      )}
    </div>
  );
}
