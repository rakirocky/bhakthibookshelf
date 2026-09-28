"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import Spinner from "@/app/components/ui/Spinner";
import { useToast } from "@/app/context/ToastContext";
import { useT } from "@/app/lib/i18n/I18nProvider";
import { isNativeApp } from "@/app/lib/offline/native";

// Self-service account deletion (App Store 5.1.1(v) / Google Play).
// What is removed and what is kept: CustomerRepository.deleteAccount.
export default function DeleteAccountPage() {
  const { showToast } = useToast();
  const { t } = useT();

  const [password, setPassword] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!understood) return;

    setLoading(true);

    try {
      const response = await fetch("/api/customer/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 ? t("del.wrongPw") : t("del.failed")
        );
      }

      // The server has already revoked every licence; clear the books
      // stored on this phone too so nothing of the account is left here.
      if (isNativeApp()) {
        const { wipeLocalLibrary } = await import("@/app/lib/offline/library");
        await wipeLocalLibrary().catch(() => undefined);
      }

      showToast(t("del.done"));

      // Full page load, like logout: drops all client state of the account.
      window.setTimeout(() => window.location.assign("/"), 1200);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t("del.failed"),
        "error"
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        href="/account"
        style={{ fontSize: 14, color: "var(--color-text-secondary)" }}
      >
        {t("pw.back")}
      </Link>

      <h1 style={{ marginTop: 16, marginBottom: 24 }}>{t("del.title")}</h1>

      <div
        style={{
          background: "var(--color-white)",
          border: "1px solid #f3c4c4",
          borderRadius: 12,
          padding: 30,
          maxWidth: 560,
        }}
      >
        <p style={{ marginTop: 0, fontWeight: 600, color: "#b42318" }}>
          {t("del.intro")}
        </p>

        <h2 style={{ fontSize: 17, margin: "20px 0 8px" }}>{t("del.willGo")}</h2>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
          <li>{t("del.goProfile")}</li>
          <li>{t("del.goLibrary")}</li>
          <li>{t("del.goDownloads")}</li>
          <li>{t("del.goNewsletter")}</li>
        </ul>

        <p style={noteStyle}>{t("del.kept")}</p>
        <p style={noteStyle}>{t("del.noRefund")}</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <label style={labelStyle} htmlFor="del-password">
            {t("del.password")}
          </label>
          <input
            id="del-password"
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              margin: "18px 0 24px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>{t("del.confirm")}</span>
          </label>

          <button
            type="submit"
            disabled={loading || !understood || !password}
            className="btn"
            style={{
              background: "#b42318",
              color: "#fff",
              border: "none",
              opacity: loading || !understood || !password ? 0.55 : 1,
            }}
          >
            {loading && <Spinner />}
            {loading ? t("del.deleting") : t("del.button")}
          </button>
        </form>
      </div>
    </div>
  );
}

const noteStyle = {
  fontSize: 14,
  color: "var(--color-text-secondary)",
  margin: "14px 0 0",
  lineHeight: 1.6,
} as const;

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
