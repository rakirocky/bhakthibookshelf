"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/app/context/ToastContext";
import Spinner from "@/app/components/ui/Spinner";

type Option = { key: string; en: string; kn: string; days: number };

/** Admin → Festivals: add one festival's date(s). */
export default function AddFestivalDateForm({ options }: { options: Option[] }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [festivalKey, setFestivalKey] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);

  const chosen = options.find((o) => o.key === festivalKey);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/festivals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festivalKey, start, end }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Unable to add the festival date.");
      }

      showToast(`${chosen?.en ?? "Festival"} added.`);
      setFestivalKey("");
      setStart("");
      setEnd("");
      router.refresh();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to add the festival date.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2 style={{ margin: "0 0 16px", fontSize: 18 }}>Add a festival date</h2>

      <div style={gridStyle}>
        <label style={labelStyle}>
          Festival
          <select
            required
            value={festivalKey}
            onChange={(e) => setFestivalKey(e.target.value)}
            style={inputStyle}
          >
            <option value="">Choose…</option>
            {options.map((o) => (
              <option key={o.key} value={o.key}>
                {o.en} · {o.kn}
              </option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          Start date
          <input
            required
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          End date <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(optional)</span>
          <input
            type="date"
            value={end}
            min={start || undefined}
            onChange={(e) => setEnd(e.target.value)}
            style={inputStyle}
          />
        </label>
      </div>

      {chosen && chosen.days > 1 && (
        <p style={hintStyle}>
          {chosen.en} usually runs over several days (last time: {chosen.days} days) — set the end date
          too. The card shows a different verse each day.
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 16 }}>
        {loading ? <Spinner /> : "Add date"}
      </button>
    </form>
  );
}

const formStyle = {
  background: "var(--color-white)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  padding: 25,
  marginBottom: 30,
} as const;

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 16,
} as const;

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontWeight: 600,
} as const;

const inputStyle = {
  padding: "10px 12px",
  border: "1px solid var(--color-border-input)",
  borderRadius: 8,
  font: "inherit",
  fontWeight: 400,
} as const;

const hintStyle = {
  margin: "12px 0 0",
  fontSize: 14,
  color: "var(--color-text-secondary)",
} as const;
