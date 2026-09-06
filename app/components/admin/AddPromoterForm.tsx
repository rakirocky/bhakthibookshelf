"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import Spinner from "../ui/Spinner";
import { useToast } from "@/app/context/ToastContext";

export default function AddPromoterForm() {
  const router = useRouter();
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [rate, setRate] = useState("10");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/promoters",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            code,
            contact_phone: phone,
            commission_rate: Number(rate),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to add promoter."
        );
      }

      showToast("Promoter added.");

      setName("");
      setCode("");
      setPhone("");
      setRate("10");
      setOpen(false);

      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to add promoter.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-primary"
      >
        + Add Promoter
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
        alignItems: "end",
      }}
    >
      <div>
        <label style={labelStyle}>Name</label>

        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>
          Referral Code
        </label>

        <input
          required
          placeholder="e.g. rahul"
          value={code}
          onChange={(e) =>
            setCode(
              e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "")
            )
          }
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>
          Phone (optional)
        </label>

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>
          Commission %
        </label>

        <input
          type="number"
          min={0}
          max={100}
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
        }}
      >
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading && <Spinner />}
          Save
        </button>

        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={loading}
          className="btn btn-outline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: 600,
  fontSize: 13,
} as const;

const inputStyle = {
  width: "100%",
  padding: "10px",
  border: "1px solid var(--color-border-input)",
  borderRadius: "6px",
} as const;
