"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import Spinner from "@/app/components/ui/Spinner";

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/customer/request-password-reset",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ phone }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Something went wrong."
        );
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageWrapStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>
          Forgot Your Password?
        </h1>

        {submitted ? (
          <>
            <p style={textStyle}>
              Got it. Our team will reset your password
              shortly and reach out to you at{" "}
              <strong>{phone}</strong> with your new one.
            </p>

            <Link
              href="/account/login"
              style={backLinkStyle}
            >
              ← Back to Sign In
            </Link>
          </>
        ) : (
          <>
            <p style={textStyle}>
              Enter the phone number on your account. Our
              team will reset your password and reach out
              to you directly — automatic reset by SMS is
              coming soon.
            </p>

            <form onSubmit={handleSubmit}>
              <label style={labelStyle}>
                Phone Number
              </label>

              <input
                required
                inputMode="numeric"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                style={inputStyle}
              />

              {error && (
                <p style={errorStyle}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block"
                style={{ marginTop: 18 }}
              >
                {loading && <Spinner />}
                {loading
                  ? "Submitting..."
                  : "Request Reset"}
              </button>
            </form>

            <Link
              href="/account/login"
              style={backLinkStyle}
            >
              ← Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
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
  maxWidth: 400,
  background: "var(--color-white)",
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: 36,
  boxShadow: "0 12px 30px rgba(0,0,0,.05)",
} as const;

const titleStyle = {
  marginTop: 0,
  marginBottom: 14,
  color: "var(--color-primary)",
  fontSize: 22,
} as const;

const textStyle = {
  color: "#555",
  fontSize: 14,
  lineHeight: 1.6,
  marginBottom: 22,
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
  marginTop: 10,
} as const;

const backLinkStyle = {
  display: "block",
  textAlign: "center",
  marginTop: 24,
  color: "var(--color-primary)",
  fontWeight: 600,
  fontSize: 14,
} as const;
