"use client";

import Link from "next/link";
import { track } from "@/app/lib/analytics/track";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

import Spinner from "@/app/components/ui/Spinner";
import { readReferralCookie } from "@/app/lib/referral/readReferralCookie";
import { safeReturnPath } from "@/app/lib/auth/safeReturnPath";
import { useT } from "@/app/lib/i18n/I18nProvider";
import type { I18nKey } from "@/app/lib/i18n/dictionary";

function noticeForPath(from: string | null): I18nKey | null {
  if (!from) {
    return null;
  }

  if (from.startsWith("/checkout")) {
    return "auth.noticeCheckout";
  }

  return "auth.noticeGeneric";
}

function LoginForm() {
  const searchParams = useSearchParams();
  const { t } = useT();

  const from = searchParams.get("from");
  const notice = noticeForPath(from);
  const resetSuccess = searchParams.get("reset") === "success";

  const signupHref = from
    ? `/account/signup?from=${encodeURIComponent(from)}`
    : "/account/signup";

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  // Lazy initializer, not an effect: this form only ever mounts on the
  // client (it's inside the Suspense boundary that useSearchParams
  // requires below, so there's no SSR pass to mismatch against), so
  // reading the cookie here is safe and avoids an extra render.
  const [referralCode, setReferralCode] = useState(
    () => readReferralCookie() ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Set when the server rejects a login because this account is
  // already active elsewhere — offers a self-service "sign out that
  // device" retry instead of just a dead-end error message.
  const [sessionConflict, setSessionConflict] = useState(false);

  async function attemptLogin(forceLogout: boolean) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/customer/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            phone,
            password,
            referralCode: referralCode.trim() || undefined,
            forceLogout: forceLogout || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.reason === "session_active_elsewhere") {
          setSessionConflict(true);
          setLoading(false);
          return;
        }

        throw new Error(
          data.message ?? t("auth.loginFailed")
        );
      }

      // Full page load, not router.push: the client router may still
      // hold a signed-out prefetch of the target (e.g. /account's
      // redirect to /account/required) and would replay it, landing a
      // just-signed-in customer on "Sign In Required".
      track("login", { method: "phone" });
      window.location.assign(safeReturnPath(from));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("auth.loginFailed")
      );

      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSessionConflict(false);
    attemptLogin(false);
  }

  return (
    <div style={pageWrapStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>
          {t("auth.welcome")}
        </h1>

        <p style={subtitleStyle}>
          {t("auth.welcomeSub")}
        </p>

        {notice && (
          <div style={noticeStyle}>
            {t(notice)}
          </div>
        )}

        {resetSuccess && (
          <div
            style={{
              ...noticeStyle,
              background: "var(--color-success-bg)",
              color: "var(--color-success-text)",
            }}
          >
            {t("auth.resetDone")}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              {t("auth.phone")}
            </label>

            <input
              required
              inputMode="numeric"
              autoComplete="username"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={labelStyle}>
              {t("auth.password")}
            </label>

            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              {t("auth.referral")}{" "}
              <span
                style={{
                  fontWeight: 400,
                  color: "var(--color-text-muted)",
                }}
              >
                {t("auth.optional")}
              </span>
            </label>

            <input
              placeholder="e.g. rajesh10"
              autoComplete="off"
              value={referralCode}
              onChange={(e) =>
                setReferralCode(e.target.value)
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
              {t("auth.referralHintLogin")}
            </p>
          </div>

          <div style={{ marginBottom: 24, textAlign: "right" }}>
            <Link
              href="/account/forgot-password"
              style={{
                fontSize: 13,
                color: "var(--color-primary)",
                fontWeight: 600,
              }}
            >
              {t("auth.forgot")}
            </Link>
          </div>

          {error && (
            <p style={errorStyle}>{error}</p>
          )}

          {sessionConflict && (
            <div
              style={{
                ...noticeStyle,
                background: "var(--color-warning-bg)",
                color: "var(--color-warning-text)",
              }}
            >
              <p style={{ margin: "0 0 10px" }}>
                {t("auth.conflict")}
              </p>

              <button
                type="button"
                disabled={loading}
                onClick={() => attemptLogin(true)}
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                {loading && <Spinner />}
                {loading
                  ? t("auth.signingOutOther")
                  : t("auth.signOutOther")}
              </button>

              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 12,
                }}
              >
                {t("auth.conflictWarn")}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            {loading && <Spinner />}
            {loading ? t("auth.signingIn") : t("auth.signIn")}
          </button>
        </form>

        <p style={footerTextStyle}>
          {t("auth.newHere")}{" "}
          <Link
            href={signupHref}
            style={{ color: "var(--color-primary)", fontWeight: 600 }}
          >
            {t("auth.createAccountLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

const pageWrapStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // faint lotus mandala behind the card, like the rest of the site
  background: "var(--mandala-bg) center / min(760px, 110%) no-repeat, var(--color-bg-page)",
  padding: 20,
} as const;

const cardStyle = {
  width: "100%",
  maxWidth: 380,
  background: "var(--color-white)",
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: 36,
  boxShadow: "0 12px 30px rgba(0,0,0,.05)",
} as const;

const titleStyle = {
  marginTop: 0,
  marginBottom: 6,
  color: "var(--color-primary)",
  fontSize: 24,
} as const;

const subtitleStyle = {
  marginTop: 0,
  marginBottom: 20,
  color: "var(--color-text-secondary)",
  fontSize: 14,
} as const;

const noticeStyle = {
  background: "var(--color-warning-bg)",
  color: "var(--color-warning-text)",
  padding: "12px 14px",
  borderRadius: 10,
  fontSize: 13,
  marginBottom: 22,
  lineHeight: 1.5,
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

const errorStyle = {
  color: "var(--color-danger-text)",
  fontSize: 13,
  marginBottom: 18,
} as const;

const footerTextStyle = {
  marginTop: 22,
  marginBottom: 0,
  fontSize: 14,
  color: "var(--color-text-secondary)",
  textAlign: "center",
} as const;
