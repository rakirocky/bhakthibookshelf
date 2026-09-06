"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

import Spinner from "@/app/components/ui/Spinner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Login failed."
        );
      }

      const redirectTo =
        searchParams.get("from") ?? "/admin";

      router.push(redirectTo);
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-page)",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: 36,
          boxShadow: "0 12px 30px rgba(0,0,0,.05)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: 6,
            color: "var(--color-primary)",
            fontSize: 24,
          }}
        >
          Bhakthi Admin
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: 28,
            color: "var(--color-text-secondary)",
            fontSize: 14,
          }}
        >
          Sign in to manage your bookstore.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
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

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
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

          {error && (
            <p
              style={{
                color: "var(--color-danger-text)",
                fontSize: 13,
                marginBottom: 18,
              }}
            >
              {error}
            </p>
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
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid var(--color-border-input)",
  borderRadius: "6px",
} as const;
