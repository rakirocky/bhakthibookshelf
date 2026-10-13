"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";

export default function MarkSubscriptionUnpaidButton({
  subscriptionId,
  wasPaid,
}: {
  subscriptionId: number;
  wasPaid: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);

  async function handleClick() {
    const message = wasPaid
      ? "Mark this subscription as unpaid? The customer loses access immediately and can subscribe again. This does NOT refund any Razorpay payment."
      : "Mark this subscription as unpaid? The customer will be able to subscribe again with a fresh payment.";

    if (!window.confirm(message)) return;

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/subscriptions/${subscriptionId}/mark-unpaid`,
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

      showToast("Subscription marked unpaid.");

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
      className="btn btn-outline"
      style={{
        padding: "6px 14px",
        fontSize: 13,
      }}
    >
      {saving ? "..." : "Mark Unpaid"}
    </button>
  );
}
