"use client";

import { FormEvent, useState } from "react";
import { useT } from "@/app/lib/i18n/I18nProvider";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const { t } = useT();

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
          data.message ?? t("news.error")
        );
      }

      setStatus("success");
      setMessage(t("news.success"));
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

        <h2>{t("news.title")}</h2>

        <p>{t("news.text")}</p>

        <form
          className="newsletter-form"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            required
            placeholder={t("news.placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
          />

          <button
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading"
              ? t("news.loading")
              : t("news.button")}
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
