"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

import Spinner from "@/app/components/ui/Spinner";

function noticeForPath(from: string | null): string | null {
  if (!from) {
    return null;
  }

  if (from.startsWith("/checkout")) {
    return "Please sign in to continue with your purchase — we'll bring you right back here.";
  }

  return "Please sign in to continue — we'll bring you right back to where you were.";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");
  const notice = noticeForPath(from);

  const signupHref = from
    ? `/account/signup?from=${encodeURIComponent(from)}`
    : "/account/signup";

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

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

          body: JSON.stringify({ phone, password }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Login failed."
        );
      }

      router.push(from ?? "/account");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed."
      );

      setLoading(false);
    }
  }

  return (
    <div style={pageWrapStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>
          Welcome Back
        </h1>

        <p style={subtitleStyle}>
          Sign in to access your books and orders.
        </p>

        {notice && (
          <div style={noticeStyle}>
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              Phone Number
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
              Password
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

          <div style={{ marginBottom: 24, textAlign: "right" }}>
            <Link
              href="/account/forgot-password"
              style={{
                fontSize: 13,
                color: "var(--color-primary)",
                fontWeight: 600,
              }}
            >
              Forgot password?
            </Link>
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={footerTextStyle}>
          New here?{" "}
          <Link
            href={signupHref}
            style={{ color: "var(--color-primary)", fontWeight: 600 }}
          >
            Create an account
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
  background: "var(--color-bg-page)",
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
