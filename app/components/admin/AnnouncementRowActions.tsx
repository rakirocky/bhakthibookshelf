"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";

export default function AnnouncementRowActions({
  id,
  isActive,
}: {
  id: number;
  isActive: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [busy, setBusy] = useState(false);

  async function handleToggle() {
    setBusy(true);

    try {
      const response = await fetch(
        `/api/admin/announcements/${id}/toggle`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ isActive: !isActive }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to update.");
      }

      router.refresh();
    } catch (error) {
      showToast("Unable to update announcement.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this announcement?")) {
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(
        `/api/admin/announcements/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete.");
      }

      showToast("Announcement deleted.");

      router.refresh();
    } catch (error) {
      showToast("Unable to delete announcement.", "error");
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
      }}
    >
      <button
        type="button"
        onClick={handleToggle}
        disabled={busy}
        className="btn btn-outline"
        style={{ padding: "6px 12px", fontSize: 13 }}
      >
        {isActive ? "Deactivate" : "Activate"}
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="btn-danger-text"
      >
        Delete
      </button>
    </div>
  );
}
