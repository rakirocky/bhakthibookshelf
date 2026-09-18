"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";

export default function UnsubscribeButton({
  id,
  email,
}: {
  id: number;
  email: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!confirm(`Unsubscribe ${email}?`)) {
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(
        `/api/admin/newsletter/${id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to unsubscribe."
        );
      }

      showToast("Subscriber removed.");

      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to unsubscribe.",
        "error"
      );

      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="btn-danger-text"
    >
      Unsubscribe
    </button>
  );
}
