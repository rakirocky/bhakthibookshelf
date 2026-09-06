"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/app/context/ToastContext";
import Spinner from "@/app/components/ui/Spinner";

export default function EmailSettingsCard({
  currentEmail,
}: {
  currentEmail: string | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [editing, setEditing] = useState(!currentEmail);
  const [email, setEmail] = useState(currentEmail ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);

    try {
      const response = await fetch(
        "/api/customer/update-email",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to update email."
        );
      }

      showToast("Email updated.");
      setEditing(false);
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to update email.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        background: currentEmail
          ? "var(--color-white)"
          : "var(--color-warning-bg)",
        border: `1px solid ${
          currentEmail
            ? "var(--color-border)"
            : "var(--color-warning-text)"
        }`,
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}
    >
      {!currentEmail && (
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 14,
            color: "var(--color-warning-text)",
            fontWeight: 600,
          }}
        >
          ⚠️ No email on file — add one so you can reset your
          password yourself if you ever forget it.
        </p>
      )}

      <p
        style={{
          margin: "0 0 12px",
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}
      >
        Email
      </p>

      {editing ? (
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{
              flex: 1,
              minWidth: 200,
              padding: "10px 12px",
              border: "1px solid var(--color-border-input)",
              borderRadius: 6,
            }}
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving && <Spinner />}
            {saving ? "Saving..." : "Save"}
          </button>

          {currentEmail && (
            <button
              type="button"
              onClick={() => {
                setEmail(currentEmail);
                setEditing(false);
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 15 }}>{currentEmail}</span>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="btn btn-outline"
            style={{ fontSize: 13 }}
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}
