import Link from "next/link";

import { FESTIVAL_KINDS, isFestivalKey } from "@/app/data/festivals";
import { istDayNumber } from "@/app/data/shlokas";
import { FestivalService } from "@/app/lib/services/festivalService";
import AddFestivalDateForm from "@/app/components/admin/AddFestivalDateForm";
import FestivalRowActions from "@/app/components/admin/FestivalRowActions";

export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;
const dayNumber = (ymd: string) => Math.floor(Date.parse(`${ymd}T00:00:00Z`) / DAY_MS);
const fmt = (ymd: string) =>
  new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-IN", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** Warn this many days before the last festival date on file. */
const RUNNING_OUT_DAYS = 90;

export default async function AdminFestivalsPage() {
  const rows = await FestivalService.getAllRows();
  const today = istDayNumber();

  // how many days each festival lasted the last time it was entered
  // (hint for the form — Navaratri 8, Deepavali 2, …)
  const lastSpan = new Map<string, number>();
  for (const r of rows) {
    lastSpan.set(r.festival_key, r.end_date ? dayNumber(r.end_date) - dayNumber(r.start_date) + 1 : 1);
  }

  const options = Object.entries(FESTIVAL_KINDS).map(([key, kind]) => ({
    key,
    en: kind.name.en,
    kn: kind.name.kn,
    days: lastSpan.get(key) ?? 1,
  }));

  const lastDay = rows.reduce((max, r) => Math.max(max, dayNumber(r.end_date ?? r.start_date)), -Infinity);
  const upcomingCount = rows.filter((r) => dayNumber(r.end_date ?? r.start_date) >= today).length;
  const daysLeft = lastDay - today;
  const lastDate = rows.length ? (rows.at(-1)!.end_date ?? rows.at(-1)!.start_date) : null;

  return (
    <div>
      <h1 style={{ marginTop: 0, marginBottom: 10 }}>Festivals</h1>

      <p style={{ color: "var(--color-text-secondary)", marginBottom: 20, maxWidth: 760 }}>
        On these dates the home page&rsquo;s &ldquo;Today&rsquo;s Shloka&rdquo; card shows a festival greeting
        and a verse for the festival, and the{" "}
        <Link href="/festivals" target="_blank" style={{ textDecoration: "underline" }}>
          Festival Calendar
        </Link>{" "}
        lists the upcoming ones. Hindu festivals follow the lunar calendar, so add each year&rsquo;s dates
        here from a panchanga (as observed in Karnataka). The greetings and verses for each festival are
        fixed — ask the developer to add a new kind of festival.
      </p>

      {rows.length === 0 || daysLeft < RUNNING_OUT_DAYS ? (
        <div style={warnStyle}>
          <strong>Add next year&rsquo;s dates.</strong>{" "}
          {rows.length === 0 || daysLeft < 0
            ? "There are no upcoming festival dates on file, so the home page is showing only the daily shloka."
            : `The last festival date on file is ${fmt(lastDate!)} — ${daysLeft} days away. After that the home page shows only the daily shloka.`}
        </div>
      ) : (
        <p style={{ marginBottom: 24, fontSize: 14, color: "var(--color-text-secondary)" }}>
          {upcomingCount} upcoming festival dates on file, up to {fmt(lastDate!)}.
        </p>
      )}

      <AddFestivalDateForm options={options} />

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--color-white)", minWidth: 720 }}>
          <thead>
            <tr style={{ background: "var(--color-bg-subtle)" }}>
              <th align="left" style={{ padding: 14 }}>Festival</th>
              <th align="left">Dates</th>
              <th align="center">Days</th>
              <th align="center">Status</th>
              <th align="center">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => {
              const kind = isFestivalKey(r.festival_key) ? FESTIVAL_KINDS[r.festival_key] : null;
              const start = dayNumber(r.start_date);
              const end = dayNumber(r.end_date ?? r.start_date);
              const status =
                end < today ? "Past" : start <= today ? "Today" : start - today === 1 ? "Tomorrow" : `In ${start - today} days`;
              const past = end < today;
              const label = `${kind?.name.en ?? r.festival_key} (${fmt(r.start_date)})`;

              return (
                <tr
                  key={r.id}
                  style={{ borderBottom: "1px solid var(--color-border)", opacity: past ? 0.55 : 1 }}
                >
                  <td style={{ padding: 14 }}>
                    <strong>{kind?.name.en ?? `Unknown (${r.festival_key})`}</strong>
                    {kind && (
                      <span lang="kn" style={{ display: "block", fontSize: 14, color: "var(--color-text-secondary)" }}>
                        {kind.name.kn}
                      </span>
                    )}
                  </td>
                  <td>
                    {fmt(r.start_date)}
                    {r.end_date && <> – {fmt(r.end_date)}</>}
                  </td>
                  <td align="center">{end - start + 1}</td>
                  <td align="center">
                    <span style={status === "Today" ? todayBadge : undefined}>{status}</span>
                  </td>
                  <td align="center">
                    <FestivalRowActions id={r.id} label={label} />
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={5} align="center" style={{ padding: 30 }}>
                  No festival dates yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const warnStyle = {
  background: "var(--color-warning-bg)",
  color: "var(--color-warning-text)",
  border: "1px solid var(--color-warning-border, rgba(180, 83, 9, 0.35))",
  borderRadius: 10,
  padding: "12px 16px",
  marginBottom: 24,
} as const;

const todayBadge = {
  background: "var(--color-primary-strong)",
  color: "#fff",
  borderRadius: 999,
  padding: "3px 10px",
  fontWeight: 600,
} as const;
