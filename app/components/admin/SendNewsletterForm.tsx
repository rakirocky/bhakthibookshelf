"use client";

import { FormEvent, useState } from "react";

import { useToast } from "@/app/context/ToastContext";

import Spinner from "../ui/Spinner";

export default function SendNewsletterForm({
  recipientCount,
}: {
  recipientCount: number;
}) {
  const { showToast } = useToast();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (recipientCount === 0) {
      showToast("There are no active subscribers to email.", "error");
      return;
    }

    if (
      !confirm(
        `Send this email to all ${recipientCount} active subscriber${
          recipientCount === 1 ? "" : "s"
        }?`
      )
    ) {
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/admin/newsletter/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Unable to send newsletter.");
      }

      showToast(
        data.failed > 0
          ? `Sent to ${data.sent} of ${data.total} subscribers — ${data.failed} failed.`
          : `Sent to all ${data.sent} subscribers.`
      );

      setSubject("");
      setMessage("");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to send newsletter.",
        "error"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 600,
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 30,
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 4 }}>Send Newsletter</h2>

      <p
        style={{
          color: "var(--color-text-secondary)",
          fontSize: 13,
          marginBottom: 20,
        }}
      >
        Emails all {recipientCount} active subscriber
        {recipientCount === 1 ? "" : "s"}, one at a time.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Subject</label>

        <input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Message</label>

        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={inputStyle}
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        style={{
          background: "var(--color-primary)",
          color: "var(--color-white)",
          border: "none",
          padding: "12px 22px",
          borderRadius: 8,
          cursor: sending ? "not-allowed" : "pointer",
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {sending && <Spinner />}
        {sending ? "Sending..." : "Send"}
      </button>
    </form>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: 600,
} as const;

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid var(--color-border-input)",
  borderRadius: "6px",
  fontFamily: "inherit",
} as const;
