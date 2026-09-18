"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";

export default function ForceLogoutButton({
  customerId,
  customerPhone,
}: {
  customerId: number;
  customerPhone: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (
      !confirm(
        `Sign ${customerPhone} out of their current device? They'll be able to log in elsewhere right away.`
      )
    ) {
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(
        `/api/admin/customers/${customerId}/force-logout`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to sign this customer out."
        );
      }

      showToast(`${customerPhone} signed out.`);

      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to sign this customer out.",
        "error"
      );
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
      Force Logout
    </button>
  );
}
