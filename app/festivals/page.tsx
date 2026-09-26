import Image from "next/image";
import Link from "next/link";

import Footer from "../components/layout/Footer";
import { FESTIVALS, booksForFestival, festivalDays, type Festival } from "../data/festivals";
import { istDayNumber } from "../data/shlokas";
import { devanagariToKannada } from "../lib/kannadaScript";
import { getAllBooks } from "../lib/services/book-service";
import { getLanguagePreference } from "../lib/language";
import { fileUrl } from "../lib/upload/fileUrl";
import { getT } from "../lib/i18n/server";
import { pageMetadata } from "../lib/seo/pageMetadata";

export const metadata = pageMetadata(
  "Hindu Festival Calendar 2026–27",
  "Dates of Navaratri, Vijayadashami, Deepavali, Ugadi, Rama Navami, Krishna Janmashtami, Ganesha Chaturthi and more, as observed in Karnataka — with a shloka for each festival.",
  "/festivals"
);

// "Next festival" and the countdown depend on today's date in India
export const dynamic = "force-dynamic";

const MONTHS_KN = [
  "ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್",
  "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್",
];

const utcDate = (ymd: string) => new Date(`${ymd}T00:00:00Z`);
const fmt = (ymd: string, opts: Intl.DateTimeFormatOptions) =>
  utcDate(ymd).toLocaleDateString("en-IN", { timeZone: "UTC", ...opts });

function dateRange(f: Festival): string {
  const long = { weekday: "short", day: "numeric", month: "short", year: "numeric" } as const;
  if (!f.to) return fmt(f.from, long);
  return `${fmt(f.from, { weekday: "short", day: "numeric", month: "short" })} – ${fmt(f.to, long)}`;
}

/** first line of the festival's first verse, in Kannada script */
function verseLine(f: Festival): string {
  return devanagariToKannada(f.shlokas[0].lines[0]).replace(/ ([।॥])/g, " $1");
}

export default async function FestivalsPage() {
  const t = await getT();
  const today = istDayNumber();
  const books = await getAllBooks(await getLanguagePreference());

  // only today's and upcoming festivals — past ones aren't useful here
  const upcoming = FESTIVALS.map((festival) => ({ festival, ...festivalDays(festival) })).filter(
    ({ end }) => end >= today
  );
  const next = upcoming[0];

  const countdown = (start: number, end: number) => {
    if (start <= today && today <= end) return t("festivals.today");
    if (start - today === 1) return t("festivals.tomorrow");
    return t("festivals.inDays", { n: start - today });
  };

  // group by the month the festival starts in
  const months = new Map<string, typeof upcoming>();
  for (const item of upcoming) {
    const key = item.festival.from.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), item]);
  }

  return (
    <>
      <main className="festivals-page">
        <section className="page-header">
          <h1>{t("festivals.title")}</h1>
          <p>{t("festivals.subtitle")}</p>
        </section>

        {next ? (
          <>
            <section className="festival-next" aria-labelledby="festival-next-title">
              <p className="festival-next__label">🪔 {t("festivals.next")}</p>
              <h2 id="festival-next-title" lang="kn">{next.festival.name.kn}</h2>
              <p className="festival-next__en">{next.festival.name.en}</p>
              <p className="festival-next__date">
                {dateRange(next.festival)} · <strong>{countdown(next.start, next.end)}</strong>
              </p>
              <blockquote lang="sa-Knda">
                {next.festival.shlokas[0].lines.map((line) => (
                  <span key={line}>{devanagariToKannada(line).replace(/ ([।॥])/g, " $1")}</span>
                ))}
              </blockquote>
              <p className="festival-next__source">— {next.festival.shlokas[0].source.en}</p>
            </section>

            {[...months].map(([month, items]) => {
              const [y, m] = month.split("-").map(Number);
              return (
                <section key={month} className="festival-month">
                  <h2>
                    {fmt(`${month}-01`, { month: "long", year: "numeric" })}
                    <span lang="kn"> · {MONTHS_KN[m - 1]} {y}</span>
                  </h2>

                  <ul className="festival-list">
                    {items.map(({ festival, start, end }) => {
                      const isToday = start <= today && today <= end;
                      const reads = booksForFestival(festival, books);
                      return (
                        <li
                          key={festival.from}
                          className={`festival-item${isToday ? " festival-item--today" : ""}`}
                        >
                          <div className="festival-item__date" aria-hidden="true">
                            <span className="festival-item__day">{fmt(festival.from, { day: "numeric" })}</span>
                            <span className="festival-item__month">{fmt(festival.from, { month: "short" })}</span>
                            <span className="festival-item__weekday">{fmt(festival.from, { weekday: "short" })}</span>
                          </div>

                          <div className="festival-item__body">
                            <h3>
                              <span lang="kn">{festival.name.kn}</span>
                              <span className="festival-item__en"> · {festival.name.en}</span>
                            </h3>
                            <p className="festival-item__when">
                              {dateRange(festival)} · <strong>{countdown(start, end)}</strong>
                            </p>
                            <p className="festival-item__verse" lang="sa-Knda">
                              {verseLine(festival)} <em>— {festival.shlokas[0].source.en}</em>
                            </p>

                            {reads.length > 0 && (
                              <div className="festival-item__reads">
                                <span>{t("festivals.readBooks")}:</span>
                                {reads.map((b) => (
                                  <Link key={b.slug} href={`/books/${b.slug}`} className="festival-read">
                                    <Image
                                      src={fileUrl(b.cover_image) || "/images/books/default-book.jpg"}
                                      alt=""
                                      width={28}
                                      height={40}
                                    />
                                    {b.title}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </>
        ) : (
          <p className="festivals-empty">{t("festivals.empty")}</p>
        )}

        <p className="festivals-note">{t("festivals.note")}</p>
      </main>

      <Footer />
    </>
  );
}
