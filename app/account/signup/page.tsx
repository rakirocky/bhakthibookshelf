"use client";

import Link from "next/link";
import { track } from "@/app/lib/analytics/track";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

import Spinner from "@/app/components/ui/Spinner";
import { readReferralCookie } from "@/app/lib/referral/readReferralCookie";
import { safeReturnPath } from "@/app/lib/auth/safeReturnPath";
import { useT } from "@/app/lib/i18n/I18nProvider";

function noticeForPath(from: string | null): string | null {
  if (!from) {
    return null;
  }

  if (from.startsWith("/checkout")) {
    return "Create an account to continue with your purchase — we'll bring you right back here.";
  }

  return "Create an account to continue — we'll bring you right back to where you were.";
}

function SignupForm() {
  const searchParams = useSearchParams();
  const { t } = useT();

  const from = searchParams.get("from");
  const notice = noticeForPath(from);

  const loginHref = from
    ? `/account/login?from=${encodeURIComponent(from)}`
    : "/account/login";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Lazy initializer, not an effect — see the same comment in
  // app/account/login/page.tsx.
  const [referralCode, setReferralCode] = useState(
    () => readReferralCookie() ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/customer/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            phone,
            email,
            password,
            referralCode: referralCode.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? t("signup.failed")
        );
      }

      track("sign_up", { method: "phone" });
      // Full page load — see the matching comment in account/login.
      window.location.assign(safeReturnPath(from));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("signup.failed")
      );

      setLoading(false);
    }
  }

  return (
    <div style={pageWrapStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>
          {t("signup.title")}
        </h1>

        <p style={subtitleStyle}>
          {t("signup.sub")}
        </p>

        {notice && (
          <div style={noticeStyle}>
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>{t("signup.name")}</label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              style={inputStyle}
            />
          </div>

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

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              {t("signup.email")}
            </label>

            <input
              required
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
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
              {t("signup.emailHint")}
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>
              {t("auth.password")}
            </label>

            <input
              required
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={inputStyle}
            />

            <p style={hintStyle}>
              {t("signup.pwHint")}
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
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

            <p style={hintStyle}>
              {t("signup.referralHint")}
            </p>
          </div>

          {error && (
            <p style={errorStyle}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            {loading && <Spinner />}
            {loading
              ? t("signup.creating")
              : t("signup.create")}
          </button>
        </form>

        <p style={footerTextStyle}>
          {t("signup.already")}{" "}
          <Link
            href={loginHref}
            style={{ color: "var(--color-primary)", fontWeight: 600 }}
          >
            {t("signup.signInLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CustomerSignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
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
  maxWidth: 400,
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

const hintStyle = {
  fontSize: 12,
  color: "var(--color-text-muted)",
  marginTop: 6,
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
