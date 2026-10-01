import Link from "next/link";

import ContactImportForm from "@/app/components/admin/ContactImportForm";
import ContactRowActions from "@/app/components/admin/ContactRowActions";
import {
  MarketingContactRepository,
  type ContactConsent,
  type ContactSource,
} from "@/app/lib/repositories/marketingContactRepository";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type Params = { source?: string; consent?: string; q?: string; page?: string };

const SOURCES: Record<ContactSource, string> = {
  all: "All sources",
  site: "Website/app users",
  import: "Imported (Excel)",
};
const CONSENTS: Record<ContactConsent, string> = {
  all: "Any consent",
  yes: "Opted in",
  unknown: "Not asked yet",
  no: "Opted out",
};

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const p = await searchParams;
  const source = (p.source && p.source in SOURCES ? p.source : "all") as ContactSource;
  const consent = (p.consent && p.consent in CONSENTS ? p.consent : "all") as ContactConsent;
  const q = (p.q ?? "").slice(0, 100);
  const page = Math.max(1, Number(p.page) || 1);

  const [stats, list, imports] = await Promise.all([
    MarketingContactRepository.stats(),
    MarketingContactRepository.list({ source, consent, q }, page, PAGE_SIZE),
    MarketingContactRepository.recentImports(),
  ]);
  const pages = Math.max(1, Math.ceil(list.total / PAGE_SIZE));

  const query = (extra: Partial<Params>) => {
    const sp = new URLSearchParams();
    const merged = { source, consent, q, ...extra };
    if (merged.source !== "all") sp.set("source", merged.source!);
    if (merged.consent !== "all") sp.set("consent", merged.consent!);
    if (merged.q) sp.set("q", merged.q);
    if (extra.page && extra.page !== "1") sp.set("page", extra.page);
    const s = sp.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div>
      <h1 style={{ marginTop: 0, marginBottom: 10 }}>Contacts</h1>
      <p style={{ color: "var(--color-text-secondary)", marginTop: 0, marginBottom: 20 }}>
        Everyone who can receive SMS / WhatsApp broadcasts: website/app users plus numbers
        imported from Excel. Each number appears once.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 26 }}>
        <Stat label="Total numbers" value={stats.total} />
        <Stat label="Website/app users" value={stats.site} />
        <Stat label="Imported (Excel)" value={stats.imported} />
        <Stat label="Opted in" value={stats.optedIn} />
        <Stat label="Opted out" value={stats.optedOut} />
      </div>

      <ContactImportForm />

      <form method="get" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <select name="source" defaultValue={source} style={input}>
          {Object.entries(SOURCES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="consent" defaultValue={consent} style={input}>
          {Object.entries(CONSENTS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input name="q" defaultValue={q} placeholder="Search name or number" style={{ ...input, minWidth: 220 }} />
        <button type="submit" className="btn-outline" style={{ padding: "9px 16px", borderRadius: 8 }}>Filter</button>
        <a href={`/api/admin/contacts/export${query({})}`} className="btn-link-text" style={{ textDecoration: "none" }}>
          ⬇ Download CSV ({list.total})
        </a>
      </form>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--color-white)", minWidth: 760 }}>
          <thead>
            <tr style={{ background: "var(--color-bg-subtle)" }}>
              <th align="left" style={{ padding: 14 }}>Mobile</th>
              <th align="left">Name</th>
              <th align="left">Language</th>
              <th align="left">Source</th>
              <th align="left">Consent</th>
              <th align="left">Added</th>
              <th align="center">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.rows.map((c) => (
              <tr key={c.phone} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: 14, fontVariantNumeric: "tabular-nums" }}>{c.phone}</td>
                <td>{c.name ?? "—"}</td>
                <td>{c.language === "kn" ? "Kannada" : c.language === "en" ? "English" : "—"}</td>
                <td>{c.is_site_user && c.in_import ? "Website/app + Excel" : c.is_site_user ? "Website/app" : "Excel"}</td>
                <td><ConsentBadge consent={c.consent} /></td>
                <td>{c.added_at ? new Date(c.added_at).toLocaleDateString("en-IN") : "—"}</td>
                <td align="center">
                  <ContactRowActions phone={c.phone} consent={c.consent} contactId={c.contact_id} isSiteUser={c.is_site_user} />
                </td>
              </tr>
            ))}
            {list.rows.length === 0 && (
              <tr>
                <td colSpan={7} align="center" style={{ padding: 30 }}>
                  {stats.total === 0 ? "No contacts yet — import an Excel file above." : "No contacts match these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 16 }}>
          {page > 1 && <Link href={`/admin/contacts${query({ page: String(page - 1) })}`}>‹ Previous</Link>}
          <span style={{ color: "var(--color-text-secondary)" }}>Page {page} of {pages}</span>
          {page < pages && <Link href={`/admin/contacts${query({ page: String(page + 1) })}`}>Next ›</Link>}
        </div>
      )}

      {imports.length > 0 && (
        <div style={{ marginTop: 34 }}>
          <h2 style={{ fontSize: 18 }}>Recent imports</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
            {imports.map((i: { id: number; filename: string; created_at: string; added: number; updated: number; skipped_invalid: number }) => (
              <li key={i.id}>
                {new Date(i.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} —{" "}
                <b>{i.filename}</b>: {i.added} new, {i.updated} already in the list
                {i.skipped_invalid > 0 && `, ${i.skipped_invalid} invalid skipped`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", borderRadius: 10, padding: "12px 18px", minWidth: 140 }}>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value.toLocaleString("en-IN")}</div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{label}</div>
    </div>
  );
}

function ConsentBadge({ consent }: { consent: "yes" | "unknown" | "no" }) {
  const map = {
    yes: { text: "Opted in", bg: "#dcfce7", fg: "#166534" },
    unknown: { text: "Not asked", bg: "#f1f5f9", fg: "#475569" },
    no: { text: "Opted out", bg: "#fee2e2", fg: "#991b1b" },
  }[consent];
  return (
    <span style={{ background: map.bg, color: map.fg, padding: "3px 10px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
      {map.text}
    </span>
  );
}

const input = {
  padding: "9px 10px",
  border: "1px solid var(--color-border-input)",
  borderRadius: 6,
  fontFamily: "inherit",
} as const;
