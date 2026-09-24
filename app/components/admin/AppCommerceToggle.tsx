"use client";

import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";

import Spinner from "../ui/Spinner";

const ENABLE_WARNING =
  "Turn ON buying inside the Android app?\n\n" +
  "The app will show prices, cart, Buy and Subscribe, and take payment " +
  "through Razorpay — immediately, for every app user.\n\n" +
  "Google Play requires Play Billing for in-app digital purchases. " +
  "Selling ebooks in the Play Store app through Razorpay can get the app " +
  "rejected or removed. Only turn this on for a build that is NOT on the " +
  "Play Store (e.g. the direct APK), or once Play Billing is in place.";

export default function AppCommerceToggle({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const { showToast } = useToast();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !enabled;

    if (next && !window.confirm(ENABLE_WARNING)) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/settings/app-commerce", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Unable to save.");
      }

      setEnabled(data.appCommerceEnabled);
      showToast(
        data.appCommerceEnabled
          ? "In-app buying is ON for the Android app."
          : "Android app is read-only again."
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to save.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, fontSize: 18 }}>
        Android app: allow buying
      </h2>

      <p
        style={{
          color: "var(--color-text-secondary)",
          margin: "0 0 16px",
          lineHeight: 1.6,
        }}
      >
        {enabled ? (
          <>
            <strong style={{ color: "var(--color-warning-text)" }}>
              ON
            </strong>{" "}
            — the app shows prices, cart, Buy and Subscribe, and customers
            pay with Razorpay inside the app.
          </>
        ) : (
          <>
            <strong>OFF (read-only)</strong> — the app is for reading
            books already on the customer&apos;s account: no prices, cart
            or buying. Purchases happen on the website. This is what
            Google Play allows without Play Billing.
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
        {enabled ? "Turn OFF (make app read-only)" : "Turn ON buying in app"}
      </button>

      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-muted)",
          margin: "12px 0 0",
        }}
      >
        Takes effect the next time a page opens in the app — no app
        update needed. The website is not affected.
      </p>
    </div>
  );
}
