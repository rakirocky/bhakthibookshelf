"use client";

import { FormEvent, useState } from "react";

import Spinner from "@/app/components/ui/Spinner";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to send your message."
        );
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your message."
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          background: "var(--color-success-bg)",
          color: "var(--color-success-text)",
          borderRadius: "var(--radius-md)",
          padding: 28,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 10 }}>
          ✓
        </div>

        <p style={{ margin: 0, fontWeight: 600 }}>
          Thank you — your message has been sent.
        </p>

        <p
          style={{
            margin: "6px 0 0",
            fontSize: 14,
            opacity: 0.85,
          }}
        >
          We'll get back to you soon.
        </p>

        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="btn btn-outline"
          style={{ marginTop: 16 }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Name</label>

        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Email</label>

        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 22 }}>
        <label style={labelStyle}>Message</label>

        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {error && (
        <p
          style={{
            color: "var(--color-danger-text)",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary"
      >
        {loading && <Spinner />}
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
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
  borderRadius: "var(--radius-sm)",
  fontFamily: "inherit",
  fontSize: 15,
} as const;
