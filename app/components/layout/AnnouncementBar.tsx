"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Announcement {
  id: number;
  message: string;
  link: string | null;
}

const PHASE_MS = 5000;

/**
 * Site-wide announcement bar (Admin → Announcements). No close button:
 * while an announcement is active the message is shown for 5 seconds
 * (popping in), then fades out and the bar stays empty for 5 seconds,
 * and so on — the next announcement each time if there are several.
 * The navy strip itself never moves, so the page doesn't jump. Pauses
 * while the message is hovered or focused so it can be read and clicked.
 */
export default function AnnouncementBar({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const pathname = usePathname();

  // tick advances every 5 s: even = shown, odd = hidden. As the message's
  // key it remounts it, which replays the pop-in / fade-out animation.
  const [tick, setTick] = useState(0);
  const [hovered, setHovered] = useState(false);
  const shown = tick % 2 === 0;
  const paused = hovered && shown;

  useEffect(() => {
    if (announcements.length === 0 || paused) {
      return;
    }

    const timer = setInterval(() => setTick((t) => t + 1), PHASE_MS);
    return () => clearInterval(timer);
  }, [announcements.length, paused]);

  // Admin has its own header — no flash bar there, same reasoning as
  // hiding the storefront Navbar on /admin.
  if (pathname?.startsWith("/admin") || announcements.length === 0) {
    return null;
  }

  // the hidden phase keeps the last message in place (fading out) so the
  // bar keeps its height
  const current = announcements[Math.floor(tick / 2) % announcements.length];

  const message = (
    <span
      key={tick}
      className={`announcement-bar__message ${shown ? "is-shown" : "is-hidden"}`}
      aria-hidden={!shown}
    >
      📢 {current.message}
    </span>
  );

  return (
    <div
      className="announcement-bar"
      role="status"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {current.link && shown ? (
        <Link href={current.link} className="announcement-bar__link">
          {message}
        </Link>
      ) : (
        message
      )}
    </div>
  );
}
