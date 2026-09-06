"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountHeader({
  label,
}: {
  label: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/customer/logout", {
      method: "POST",
    });

    router.push("/");
    router.refresh();
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
          Logout
        </button>
      </div>
    </header>
  );
}
