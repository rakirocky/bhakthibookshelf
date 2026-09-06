"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";

import Spinner from "../ui/Spinner";

const ORDER_STATUSES = [
  "CREATED",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

export default function OrderStatusForm({
  orderId,
  currentOrderStatus,
  currentPaymentStatus,
}: {
  orderId: number;
  currentOrderStatus: string;
  currentPaymentStatus: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [orderStatus, setOrderStatus] = useState(
    currentOrderStatus
  );

  const [paymentStatus, setPaymentStatus] = useState(
    currentPaymentStatus
  );

  const [saving, setSaving] = useState(false);

  const isDirty =
    orderStatus !== currentOrderStatus ||
    paymentStatus !== currentPaymentStatus;

  async function handleSave() {
    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            order_status: orderStatus,
            payment_status: paymentStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Update failed");
      }

      showToast("Order updated.");

      router.refresh();
    } catch (error) {
      console.error(error);

      showToast("Unable to update order.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          Order Status
        </label>

        <select
          value={orderStatus}
          onChange={(e) =>
            setOrderStatus(e.target.value)
          }
          style={selectStyle}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          Payment Status
        </label>

        <select
          value={paymentStatus}
          onChange={(e) =>
            setPaymentStatus(e.target.value)
          }
          style={selectStyle}
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !isDirty}
        style={{
          background: "var(--color-primary)",
          color: "var(--color-white)",
          border: "none",
          padding: "10px 20px",
          borderRadius: 8,
          cursor:
            saving || !isDirty
              ? "not-allowed"
              : "pointer",
          fontWeight: 600,
          opacity: saving || !isDirty ? 0.6 : 1,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {saving && <Spinner />}
        {saving ? "Saving..." : "Save Status"}
      </button>
    </div>
  );
}

const selectStyle = {
  width: "100%",
  padding: "10px",
  border: "1px solid var(--color-border-input)",
  borderRadius: 6,
} as const;
