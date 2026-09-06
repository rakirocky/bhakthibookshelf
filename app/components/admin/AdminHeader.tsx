"use client";

import { useRouter } from "next/navigation";

export default function AdminHeader({
  adminLabel,
}: {
  adminLabel: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });

    router.push("/admin/login");
    router.refresh();
  }

  const initial = adminLabel.charAt(0).toUpperCase() || "A";

  return (
    <header className="admin-header">
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 28,
          }}
        >
          Admin Dashboard
        </h1>

        <p
          style={{
            marginTop: 6,
            color: "var(--color-text-secondary)",
          }}
        >
          Manage your bookstore
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 15,
          alignItems: "center",
        }}
      >
        <input
          placeholder="Search..."
          className="admin-header-search"
        />

        <span
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            whiteSpace: "nowrap",
          }}
        >
          {adminLabel}
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

        <div
          style={{
            width: 45,
            height: 45,
            borderRadius: "50%",
            background: "var(--color-primary)",
            color: "var(--color-white)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initial}
        </div>
      </div>
    </header>
  );
}
