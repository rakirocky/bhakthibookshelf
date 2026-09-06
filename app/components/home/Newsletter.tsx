"use client";

import { FormEvent, useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to subscribe."
        );
      }

      setStatus("success");
      setMessage("You're subscribed — thank you!");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to subscribe."
      );
    }
  }

  return (
    <section className="newsletter">

      <div className="container">

        <h2>Stay Connected</h2>

        <p>
          Subscribe to receive updates about new devotional books,
          festival collections and special offers.
        </p>

        <form
          className="newsletter-form"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            required
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
          />

          <button
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading"
              ? "Subscribing..."
              : "Subscribe"}
          </button>
        </form>

        {status === "success" && (
          <p
            style={{
              color: "var(--color-success-text)",
              marginTop: 12,
              fontSize: 14,
            }}
          >
            ✓ {message}
          </p>
        )}

        {status === "error" && (
          <p
            style={{
              color: "var(--color-danger-text)",
              marginTop: 12,
              fontSize: 14,
            }}
          >
            {message}
          </p>
        )}

      </div>

    </section>
  );
}
