"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MarkMessageReadButton({
  id,
}: {
  id: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);

    try {
      await fetch(`/api/admin/contact-messages/${id}/read`, {
        method: "POST",
      });

      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="btn btn-outline"
      style={{ padding: "6px 12px", fontSize: 13 }}
    >
      Mark Read
    </button>
  );
}
