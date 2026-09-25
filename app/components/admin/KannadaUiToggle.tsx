"use client";

import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";

import Spinner from "../ui/Spinner";

export default function KannadaUiToggle({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const { showToast } = useToast();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !enabled;
    setSaving(true);

    try {
      const response = await fetch("/api/admin/settings/kannada-ui", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Unable to save.");
      }

      setEnabled(data.kannadaUiEnabled);
      showToast(
        data.kannadaUiEnabled
          ? "Website will be shown in Kannada when ಕನ್ನಡ is chosen."
          : "ಕನ್ನಡ now only filters books — website stays in English."
      );
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to save.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, fontSize: 18 }}>
        Translate website into Kannada
      </h2>

      <p style={{ color: "var(--color-text-secondary)", margin: "0 0 16px", lineHeight: 1.6 }}>
        {enabled ? (
          <>
            <strong style={{ color: "var(--color-success-text)" }}>ON</strong> — when a
            visitor chooses <strong>ಕನ್ನಡ</strong>, they see only Kannada books{" "}
            <em>and</em> the website (menus, buttons, headings) is shown in Kannada.
          </>
        ) : (
          <>
            <strong>OFF</strong> — choosing <strong>ಕನ್ನಡ</strong> only shows Kannada
            books; the website itself stays in English.
          </>
        )}
      </p>

      <button
        type="button"
        className={enabled ? "btn btn-outline" : "btn btn-primary"}
        onClick={toggle}
        disabled={saving}
      >
        {saving && <Spinner />}
        {enabled ? "Turn OFF (English website)" : "Turn ON Kannada website"}
      </button>

      <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "12px 0 0" }}>
        Applies to the website and the Android app immediately. Book filtering by
        language works either way.
      </p>
    </div>
  );
}
