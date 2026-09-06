"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Announcement {
  id: number;
  message: string;
  link: string | null;
}

const DISMISS_KEY = "announcement_bar_dismissed";

export default function AnnouncementBar({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const pathname = usePathname();

  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(
      sessionStorage.getItem(DISMISS_KEY) === "true"
    );
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [announcements.length]);

  // Admin has its own header — no flash bar there, same reasoning as
  // hiding the storefront Navbar on /admin.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  if (dismissed || announcements.length === 0) {
    return null;
  }

  const current = announcements[index];

  function handleDismiss() {
    sessionStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  }

  const content = (
    <span>
      📢 {current.message}
    </span>
  );

  return (
    <div
      style={{
        background: "var(--color-navy)",
        color: "var(--color-white)",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontSize: 14,
        fontWeight: 600,
        position: "relative",
      }}
    >
      {current.link ? (
        <Link
          href={current.link}
          style={{ color: "var(--color-white)", textDecoration: "underline" }}
        >
          {content}
        </Link>
      ) : (
        content
      )}

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          position: "absolute",
          right: 16,
          background: "none",
          border: "none",
          color: "var(--color-white)",
          opacity: 0.7,
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}
