import { shlokaOfTheDay } from "../../data/festivals";
import { devanagariToKannada } from "../../lib/kannadaScript";
import { getT } from "../../lib/i18n/server";
import { FestivalService } from "../../lib/services/festivalService";
import Link from "next/link";

import ShareShloka from "./ShareShloka";

/**
 * Home page "Today's Shloka" — a new verse each day (India date), shown
 * in Kannada script (converted from the verified Devanagari in
 * app/data/shlokas.ts) with its meaning in Kannada and English. On
 * festival days (app/data/festivals.ts) it shows a festival greeting and
 * a verse for the festival instead.
 */
export default async function DailyShloka() {
  const t = await getT();
  const { shloka, festival } = shlokaOfTheDay(await FestivalService.getFestivals());
  // non-breaking space before । ॥ so a danda never wraps onto its own line
  const lines = shloka.lines.map((l) => devanagariToKannada(l).replace(/ ([।॥])/g, "\u00A0$1"));

  return (
    <section className="daily-shloka" aria-labelledby="daily-shloka-title">
      <div className={`daily-shloka__card${festival ? " daily-shloka__card--festival" : ""}`}>
        <p id="daily-shloka-title" className="daily-shloka__label">
          🪔 {t(festival ? "shloka.festivalTitle" : "shloka.title")}
        </p>

        {festival && (
          <div className="daily-shloka__festival">
            <p className="daily-shloka__greeting" lang="kn">{festival.greeting.kn}</p>
            <p className="daily-shloka__greeting-en" lang="en">{festival.greeting.en}</p>
          </div>
        )}

        <blockquote className="daily-shloka__verse" lang="sa-Knda">
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </blockquote>

        <p className="daily-shloka__source">— {shloka.source.en}</p>

        <div className="daily-shloka__divider" aria-hidden="true" />

        <p className="daily-shloka__meaning" lang="kn">
          <strong>ಅರ್ಥ:</strong> {shloka.meaning.kn}
        </p>

        <p className="daily-shloka__meaning" lang="en">
          <strong>Meaning:</strong> {shloka.meaning.en}
        </p>

        <ShareShloka
          text={`${
            festival
              ? `🪔 ${festival.greeting.kn} · ${festival.greeting.en}`
              : "🪔 ಇಂದಿನ ಶ್ಲೋಕ · Today's Shloka"
          }\n\n${lines.join("\n")}\n— ${shloka.source.kn}\n\nಅರ್ಥ: ${shloka.meaning.kn}\n\nMeaning: ${shloka.meaning.en}`}
          label={t("shloka.share")}
        />

        <Link href="/festivals" className="daily-shloka__calendar">
          📅 {t("festivals.cardLink")}
        </Link>
      </div>
    </section>
  );
}
