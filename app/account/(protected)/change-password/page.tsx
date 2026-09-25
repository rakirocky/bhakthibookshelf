"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import Spinner from "@/app/components/ui/Spinner";
import { useToast } from "@/app/context/ToastContext";
import { useT } from "@/app/lib/i18n/I18nProvider";

export default function ChangePasswordPage() {
  const { showToast } = useToast();
  const { t } = useT();

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
        t("pw.mismatch"),
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
          data.message ?? t("pw.failed")
        );
      }

      showToast(t("pw.done"));

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : t("pw.failed"),
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
        {t("pw.back")}
      </Link>

      <h1
        style={{
          marginTop: 16,
          marginBottom: 24,
        }}
      >
        {t("pw.title")}
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
              {t("pw.current")}
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
              {t("forgot.newPw")}
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
              {t("signup.pwHint")}
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>
              {t("forgot.confirmPw")}
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
              ? t("pw.saving")
              : t("pw.title")}
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
