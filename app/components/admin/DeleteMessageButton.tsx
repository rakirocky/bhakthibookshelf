"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";

export default function DeleteMessageButton({
  id,
}: {
  id: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!confirm("Delete this message?")) {
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(
        `/api/admin/contact-messages/${id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to delete message."
        );
      }

      showToast("Message deleted.");

      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to delete message.",
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
      Delete
    </button>
  );
}
