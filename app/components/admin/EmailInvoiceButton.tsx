"use client";

import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";
import Spinner from "../ui/Spinner";

export default function EmailInvoiceButton({
  orderId,
}: {
  orderId: number;
}) {
  const { showToast } = useToast();

  const [sending, setSending] = useState(false);

  async function handleClick() {
    setSending(true);

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/email-invoice`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to send invoice email."
        );
      }

      showToast("Invoice emailed to the customer.");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to send invoice email.",
        "error"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={sending}
      className="btn btn-outline"
      style={{
        fontSize: 14,
      }}
    >
      {sending && <Spinner variant="dark" />}
      {sending ? "Sending..." : "✉️ Email Invoice"}
    </button>
  );
}
