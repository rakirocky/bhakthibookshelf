"use client";

import { FormEvent, useState } from "react";

import { useToast } from "@/app/context/ToastContext";
import { StoreSettings } from "@/app/lib/types/settings";

import Spinner from "../ui/Spinner";

export default function SettingsForm({
  initialSettings,
}: {
  initialSettings: StoreSettings;
}) {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    store_name: initialSettings.store_name ?? "",
    contact_email: initialSettings.contact_email ?? "",
    contact_phone: initialSettings.contact_phone ?? "",
    address: initialSettings.address ?? "",
    gst_number: initialSettings.gst_number ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(
    null
  );

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSavedAt(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setSaving(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to save settings."
        );
      }

      setSavedAt(
        new Date().toLocaleTimeString("en-IN")
      );

      showToast("Settings saved.");
    } catch (error) {
      console.error(error);

      showToast(
        error instanceof Error
          ? error.message
          : "Unable to save settings.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          Store Name
        </label>

        <input
          required
          value={form.store_name}
          onChange={(e) =>
            update("store_name", e.target.value)
          }
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          Contact Email
        </label>

        <input
          type="email"
          value={form.contact_email}
          onChange={(e) =>
            update("contact_email", e.target.value)
          }
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          Contact Phone
        </label>

        <input
          value={form.contact_phone}
          onChange={(e) =>
            update("contact_phone", e.target.value)
          }
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          Address
        </label>

        <textarea
          rows={3}
          value={form.address}
          onChange={(e) =>
            update("address", e.target.value)
          }
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 30 }}>
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          GST Number
        </label>

        <input
          value={form.gst_number}
          onChange={(e) =>
            update("gst_number", e.target.value)
          }
          style={inputStyle}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <button
          type="submit"
          disabled={saving}
          style={{
            background: "var(--color-primary)",
            color: "var(--color-white)",
            border: "none",
            padding: "12px 22px",
            borderRadius: 8,
            cursor: saving
              ? "not-allowed"
              : "pointer",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {saving && <Spinner />}
          {saving ? "Saving..." : "Save Settings"}
        </button>

        {savedAt && (
          <span
            style={{
              fontSize: 13,
              color: "var(--color-success-text)",
            }}
          >
            ✓ Saved at {savedAt}
          </span>
        )}
      </div>
    </form>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid var(--color-border-input)",
  borderRadius: "6px",
} as const;
