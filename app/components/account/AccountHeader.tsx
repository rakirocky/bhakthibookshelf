"use client";

import Link from "next/link";
import { useT } from "@/app/lib/i18n/I18nProvider";

export default function AccountHeader({
  label,
}: {
  label: string;
}) {
  const { t } = useT();

  async function handleLogout() {
    await fetch("/api/customer/logout", {
      method: "POST",
    });

    // Full page load, like login: resets client state that belongs to
    // the account (e.g. the wishlist) so it doesn't linger on screen.
    window.location.assign("/");
  }

  return (
    <header
      style={{
        background: "var(--color-white)",
        borderBottom: "1px solid var(--color-border)",
        padding: "18px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <Link
        href="/"
        style={{
          fontWeight: 700,
          color: "var(--color-navy)",
          fontSize: 18,
        }}
      >
        Bhakthi Bookshelf
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: "var(--color-text-secondary)",
          }}
        >
          {label}
        </span>

        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-outline"
          style={{
            padding: "8px 14px",
            fontSize: 13,
          }}
        >
          {t("account.logout")}
        </button>
      </div>
    </header>
  );
}
