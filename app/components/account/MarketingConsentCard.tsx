"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/app/context/ToastContext";
import Spinner from "@/app/components/ui/Spinner";
import { useT } from "@/app/lib/i18n/I18nProvider";

export default function MarketingConsentCard({
  phone,
  optedIn,
}: {
  phone: string;
  optedIn: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useT();

  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    setSaving(true);

    try {
      const response = await fetch(
        "/api/customer/marketing-consent",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ optIn: !optedIn }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? t("consent.failed")
        );
      }

      showToast(
        optedIn
          ? t("consent.unsubscribed")
          : t("consent.subscribed")
      );
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : t("consent.failed"),
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}
      >
        {t("consent.title")}
      </p>

      <p
        style={{
          margin: "0 0 12px",
          fontSize: 14,
          color: "var(--color-text-secondary)",
        }}
      >
        {t("consent.desc", { phone })}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 15,
            color: optedIn
              ? "var(--color-success-text)"
              : "var(--color-text-strong)",
          }}
        >
          {optedIn ? t("consent.on") : t("consent.off")}
        </span>

        <button
          type="button"
          onClick={handleToggle}
          disabled={saving}
          className={optedIn ? "btn btn-outline" : "btn btn-primary"}
          style={{ fontSize: 13 }}
        >
          {saving && <Spinner />}
          {saving
            ? t("pw.saving")
            : optedIn
              ? t("consent.unsubscribe")
              : t("consent.subscribe")}
        </button>
      </div>
    </div>
  );
}
