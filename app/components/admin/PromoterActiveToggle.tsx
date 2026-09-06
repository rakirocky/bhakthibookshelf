"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";

export default function PromoterActiveToggle({
  promoterId,
  isActive,
}: {
  promoterId: number;
  isActive: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/promoters/${promoterId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            is_active: !isActive,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to update promoter.");
      }

      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to update promoter.",
        "error"
      );

      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={saving}
      className="btn btn-outline"
      style={{
        padding: "6px 12px",
        fontSize: 13,
        color: isActive ? "var(--color-danger-text)" : "var(--color-success-text)",
      }}
    >
      {saving
        ? "..."
        : isActive
        ? "Deactivate"
        : "Activate"}
    </button>
  );
}
