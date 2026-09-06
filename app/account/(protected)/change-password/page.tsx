"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import Spinner from "@/app/components/ui/Spinner";
import { useToast } from "@/app/context/ToastContext";

export default function ChangePasswordPage() {
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast(
        "New password and confirmation don't match.",
        "error"
      );

      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/customer/change-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to change password."
        );
      }

      showToast("Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to change password.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        href="/account"
        style={{
          fontSize: 14,
          color: "var(--color-text-secondary)",
        }}
      >
        ← Back to My Account
      </Link>

      <h1
        style={{
          marginTop: 16,
          marginBottom: 24,
        }}
      >
        Change Password
      </h1>

      <div
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: 30,
          maxWidth: 420,
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              Current Password
            </label>

            <input
              required
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              New Password
            </label>

            <input
              required
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              style={inputStyle}
            />

            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginTop: 6,
              }}
            >
              At least 8 characters.
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>
              Confirm New Password
            </label>

            <input
              required
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading && <Spinner />}
            {loading
              ? "Saving..."
              : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: 600,
  fontSize: 14,
} as const;

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid var(--color-border-input)",
  borderRadius: "6px",
} as const;
