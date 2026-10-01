"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/app/context/ToastContext";

// Per-contact actions on Admin → Contacts.
export default function ContactRowActions({
  phone,
  consent,
  contactId,
  isSiteUser,
}: {
  phone: string;
  consent: "yes" | "unknown" | "no";
  contactId: number | null;
  isSiteUser: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function call(url: string, init: RequestInit, done: string) {
    setBusy(true);
    try {
      const res = await fetch(url, init);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message ?? "Unable to update.");
      showToast(done);
      router.refresh();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Unable to update.", "error");
    } finally {
      setBusy(false);
    }
  }

  const setConsent = (c: "yes" | "no") =>
    call(
      "/api/admin/contacts/consent",
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, consent: c }) },
      c === "yes" ? "Marked as opted in." : "Marked as opted out — they won't be messaged."
    );

  return (
    <span style={{ display: "inline-flex", gap: 12, whiteSpace: "nowrap" }}>
      {consent !== "yes" && (
        <button type="button" className="btn-link-text" disabled={busy}
          onClick={() => confirm(`Mark ${phone} as agreed to receive messages?`) && setConsent("yes")}>
          Opt in
        </button>
      )}
      {consent !== "no" && (
        <button type="button" className="btn-danger-text" disabled={busy}
          onClick={() => confirm(`Mark ${phone} as opted out? They won't receive any messages.`) && setConsent("no")}>
          Opt out
        </button>
      )}
      {contactId !== null && !isSiteUser && (
        <button type="button" className="btn-danger-text" disabled={busy}
          onClick={() => confirm(`Delete ${phone} from the imported list?`) &&
            call(`/api/admin/contacts/${contactId}`, { method: "DELETE" }, "Contact deleted.")}>
          Delete
        </button>
      )}
    </span>
  );
}
