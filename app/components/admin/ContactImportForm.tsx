"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/app/context/ToastContext";

import Spinner from "../ui/Spinner";

type Summary = {
  columns: { phone: string; name: string | null; language: string | null };
  totalRows: number;
  valid: number;
  invalid: number;
  invalidSamples: { row: number; value: string }[];
  duplicatesInFile: number;
  sample: { phone: string; name: string | null; language: string | null }[];
  alreadyImported?: number;
  siteUsers?: number;
  added?: number;
  updated?: number;
};

// Step 1: choose a file → the server reads it and shows what it found.
// Step 2: "Import" sends the same file again with confirm=1.
export default function ContactImportForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(f: File, confirm: boolean) {
    const body = new FormData();
    body.append("file", f);
    if (confirm) body.append("confirm", "1");
    const res = await fetch("/api/admin/contacts/import", { method: "POST", body });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message ?? "Import failed.");
    return data as Summary;
  }

  async function choose(f: File | null) {
    setFile(f);
    setPreview(null);
    if (!f) return;
    setBusy(true);
    try {
      setPreview(await send(f, false));
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't read this file.", "error");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setBusy(false);
    }
  }

  async function importNow() {
    if (!file) return;
    setBusy(true);
    try {
      const r = await send(file, true);
      showToast(`Imported: ${r.added} new, ${r.updated} already in the list.`);
      setFile(null);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Import failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  const newNumbers = preview ? preview.valid - (preview.alreadyImported ?? 0) : 0;

  return (
    <div style={box}>
      <h2 style={{ marginTop: 0, marginBottom: 4 }}>Import from Excel</h2>
      <p style={hint}>
        Upload an <b>.xlsx</b> or <b>.csv</b> file with a mobile number column (and optionally Name
        and Language — English or Kannada headings both work). Numbers like +91 98765 43210,
        919876543210 or 09876543210 are cleaned automatically; duplicates are skipped.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        disabled={busy}
        onChange={(e) => choose(e.target.files?.[0] ?? null)}
      />

      {busy && !preview && (
        <p style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Spinner /> Reading file…
        </p>
      )}

      {preview && (
        <div style={{ marginTop: 18 }}>
          <p style={{ margin: "0 0 10px" }}>
            Found columns — Mobile: <b>{preview.columns.phone}</b>
            {preview.columns.name && <>, Name: <b>{preview.columns.name}</b></>}
            {preview.columns.language && <>, Language: <b>{preview.columns.language}</b></>}
          </p>
          <ul style={{ margin: "0 0 12px", paddingLeft: 20, lineHeight: 1.7 }}>
            <li>{preview.totalRows} rows in the file</li>
            <li><b>{preview.valid}</b> valid mobile numbers — <b>{newNumbers}</b> new, {preview.alreadyImported} already imported</li>
            {!!preview.siteUsers && <li>{preview.siteUsers} of them are already website/app users</li>}
            {preview.duplicatesInFile > 0 && <li>{preview.duplicatesInFile} repeated numbers in the file (counted once)</li>}
            {preview.invalid > 0 && (
              <li style={{ color: "#b45309" }}>
                {preview.invalid} rows skipped — not a valid Indian mobile number
                {preview.invalidSamples.length > 0 &&
                  ` (e.g. row ${preview.invalidSamples.map((s) => `${s.row}: "${s.value}"`).join(", row ")})`}
              </li>
            )}
          </ul>

          {preview.sample.length > 0 && (
            <table style={{ borderCollapse: "collapse", marginBottom: 14, fontSize: 14 }}>
              <tbody>
                {preview.sample.map((c) => (
                  <tr key={c.phone}>
                    <td style={cell}>{c.phone}</td>
                    <td style={cell}>{c.name ?? "—"}</td>
                    <td style={cell}>{c.language === "kn" ? "Kannada" : c.language === "en" ? "English" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={importNow} disabled={busy || preview.valid === 0} style={primary}>
              {busy && <Spinner />}
              {busy ? "Importing…" : `Import ${preview.valid} numbers`}
            </button>
            <button
              type="button"
              disabled={busy}
              className="btn-outline"
              style={{ padding: "10px 18px", borderRadius: 8 }}
              onClick={() => {
                setFile(null);
                setPreview(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const box = {
  maxWidth: 760,
  background: "var(--color-white)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  padding: 24,
  marginBottom: 30,
} as const;

const hint = { color: "var(--color-text-secondary)", fontSize: 13, marginBottom: 16 } as const;

const cell = { padding: "4px 14px 4px 0", borderBottom: "1px solid var(--color-border)" } as const;

const primary = {
  background: "var(--color-primary)",
  color: "var(--color-white)",
  border: "none",
  padding: "10px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
} as const;
