"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import Spinner from "@/app/components/ui/Spinner";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<"phone" | "reset">("phone");
  const [phone, setPhone] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleRequestOtp(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/customer/forgot-password/request-otp",
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
          data.message ?? "Something went wrong. Please try again."
        );
      }

      // Only reachable on a genuine success — the message here really
      // is the generic "if an account exists..." text, not an error
      // that got mistakenly treated as one.
      setInfo(data.message);
      setStep("reset");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();

    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/customer/forgot-password/verify-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            phone,
            otp,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to reset password."
        );
      }

      router.push(
        "/account/login?reset=success"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset password."
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

        {step === "phone" ? (
          <>
            <p style={textStyle}>
              Enter the phone number on your account —
              we'll email a reset code to the address on
              file.
            </p>

            <form onSubmit={handleRequestOtp}>
              <label style={labelStyle}>
                Phone Number
              </label>

              <input
                required
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p style={textStyle}>{info}</p>

            <form onSubmit={handleResetPassword}>
              <label style={labelStyle}>
                6-Digit Code
              </label>

              <input
                required
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                  ...inputStyle,
                  letterSpacing: 4,
                  fontSize: 18,
                  textAlign: "center",
                }}
              />

              <label style={{ ...labelStyle, marginTop: 16 }}>
                New Password
              </label>

              <input
                required
                type="password"
                minLength={6}
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                style={inputStyle}
              />

              <label style={{ ...labelStyle, marginTop: 16 }}>
                Confirm New Password
              </label>

              <input
                required
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
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
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <p
              style={{
                textAlign: "center",
                fontSize: 13,
                marginTop: 16,
              }}
            >
              Didn't get a code?{" "}
              <button
                type="button"
                onClick={() => setStep("phone")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-primary)",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Try again
              </button>
            </p>

            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginTop: 6,
              }}
            >
              Still stuck, or don't have an email on your
              account?{" "}
              <Link
                href="/contact"
                style={{
                  color: "var(--color-primary)",
                  fontWeight: 600,
                }}
              >
                Contact us
              </Link>{" "}
              for help.
            </p>
          </>
        )}

        <Link href="/account/login" style={backLinkStyle}>
          ← Back to Sign In
        </Link>
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
