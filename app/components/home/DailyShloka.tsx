import { shlokaForToday } from "../../data/shlokas";
import { devanagariToKannada } from "../../lib/kannadaScript";
import { getT } from "../../lib/i18n/server";
import ShareShloka from "./ShareShloka";

/**
 * Home page "Today's Shloka" — a new verse each day (India date), shown
 * in Kannada script (converted from the verified Devanagari in
 * app/data/shlokas.ts) with its English translation.
 */
export default async function DailyShloka() {
  const t = await getT();
  const { shloka } = shlokaForToday();
  // non-breaking space before । ॥ so a danda never wraps onto its own line
  const lines = shloka.lines.map((l) => devanagariToKannada(l).replace(/ ([।॥])/g, "\u00A0$1"));

  return (
    <section className="daily-shloka" aria-labelledby="daily-shloka-title">
      <div className="daily-shloka__card">
        <p id="daily-shloka-title" className="daily-shloka__label">
          🪔 {t("shloka.title")}
        </p>

        <blockquote className="daily-shloka__verse" lang="sa-Knda">
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </blockquote>

        <p className="daily-shloka__source">— {shloka.source.en}</p>

        <div className="daily-shloka__divider" aria-hidden="true" />

        <p className="daily-shloka__meaning" lang="en">
          <strong>Meaning:</strong> {shloka.meaning.en}
        </p>

        <ShareShloka
          text={`🪔 Today's Shloka\n\n${lines.join("\n")}\n— ${shloka.source.en}\n\nMeaning: ${shloka.meaning.en}`}
          label={t("shloka.share")}
        />
      </div>
    </section>
  );
}
