"use client";

import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";
import Spinner from "../ui/Spinner";

export default function ResetCustomerPasswordButton({
  customerId,
  customerPhone,
}: {
  customerId: number;
  customerPhone: string;
}) {
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleReset() {
    if (newPassword.length < 8) {
      showToast(
        "Password must be at least 8 characters.",
        "error"
      );

      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/customers/${customerId}/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ newPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to reset password."
        );
      }

      showToast(
        `Password reset for ${customerPhone}. Share it with them directly.`
      );

      setOpen(false);
      setNewPassword("");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to reset password.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-outline"
        style={{
          padding: "6px 12px",
          fontSize: 13,
        }}
      >
        Reset Password
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <input
        type="text"
        placeholder="New password"
        value={newPassword}
        onChange={(e) =>
          setNewPassword(e.target.value)
        }
        style={{
          padding: "6px 10px",
          border: "1px solid var(--color-border-input)",
          borderRadius: 6,
          fontSize: 13,
          width: 140,
        }}
      />

      <button
        type="button"
        onClick={handleReset}
        disabled={saving}
        className="btn btn-primary"
        style={{
          padding: "6px 12px",
          fontSize: 13,
        }}
      >
        {saving && <Spinner />}
        Save
      </button>

      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setNewPassword("");
        }}
        disabled={saving}
        style={{
          background: "none",
          border: "none",
          color: "var(--color-text-secondary)",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  );
}
