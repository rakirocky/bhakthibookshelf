"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";

export default function FestivalRowActions({ id, label }: { id: number; label: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete ${label}?`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/festivals/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      showToast("Festival date deleted.");
      router.refresh();
    } catch {
      showToast("Unable to delete the festival date.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="btn btn-outline" onClick={handleDelete} disabled={busy}>
      Delete
    </button>
  );
}
