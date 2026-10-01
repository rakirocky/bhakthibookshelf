import { MarketingContactRepository, type ContactFilters } from "@/app/lib/repositories/marketingContactRepository";

function csvCell(v: unknown) {
  const s = v === null || v === undefined ? "" : String(v);
  // Leading = + - @ would run as a formula when opened in Excel.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

// Downloads the contacts matching the page's filters as a CSV that opens
// in Excel (UTF-8 BOM so Kannada names display correctly).
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const filters: ContactFilters = {
    source: (sp.get("source") as ContactFilters["source"]) ?? "all",
    consent: (sp.get("consent") as ContactFilters["consent"]) ?? "all",
    q: sp.get("q") ?? "",
  };
  const rows = await MarketingContactRepository.all(filters);
  const lines = [
    ["Mobile", "Name", "Language", "Source", "Consent", "Added"].join(","),
    ...rows.map((r) =>
      [
        r.phone,
        r.name,
        r.language === "kn" ? "Kannada" : r.language === "en" ? "English" : "",
        r.is_site_user && r.in_import ? "Website/app + Excel" : r.is_site_user ? "Website/app" : "Excel",
        r.consent,
        r.added_at ? new Date(r.added_at).toISOString().slice(0, 10) : "",
      ].map(csvCell).join(",")
    ),
  ];
  const date = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contacts-${date}.csv"`,
    },
  });
}
