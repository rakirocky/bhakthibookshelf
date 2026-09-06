"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/app/context/ToastContext";
import Spinner from "@/app/components/ui/Spinner";

export default function AddAnnouncementForm() {
  const router = useRouter();
  const { showToast } = useToast();

  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/announcements",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ message, link }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to create announcement."
        );
      }

      showToast("Announcement added.");

      setMessage("");
      setLink("");

      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to create announcement.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: 25,
        marginBottom: 30,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          Message
        </label>

        <input
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. New: Ramayana now available! Festival offer — 20% off this week."
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
          Link (optional)
        </label>

        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="/books/ramayana"
          style={inputStyle}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary"
      >
        {loading && <Spinner />}
        {loading ? "Adding..." : "Add Announcement"}
      </button>
    </form>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid var(--color-border-input)",
  borderRadius: "6px",
} as const;
