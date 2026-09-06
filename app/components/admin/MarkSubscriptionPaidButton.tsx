"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";

export default function MarkSubscriptionPaidButton({
  subscriptionId,
}: {
  subscriptionId: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);

  async function handleClick() {
    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/subscriptions/${subscriptionId}/mark-paid`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to update subscription."
        );
      }

      showToast("Subscription activated.");

      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to update subscription.",
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
      className="btn btn-primary"
      style={{
        padding: "6px 14px",
        fontSize: 13,
      }}
    >
      {saving ? "..." : "Mark Paid"}
    </button>
  );
}
