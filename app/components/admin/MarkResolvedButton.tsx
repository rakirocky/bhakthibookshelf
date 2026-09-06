"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";

export default function MarkResolvedButton({
  requestId,
}: {
  requestId: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);

  async function handleClick() {
    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/password-resets/${requestId}/resolve`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to update request.");
      }

      showToast("Marked as resolved.");

      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to update request.",
        "error"
      );

      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      className="btn btn-outline"
      style={{
        padding: "6px 12px",
        fontSize: 13,
      }}
    >
      {saving ? "..." : "Mark Resolved"}
    </button>
  );
}
