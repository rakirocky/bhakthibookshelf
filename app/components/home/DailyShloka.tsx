import { shlokaForToday } from "../../data/shlokas";
import { getLanguagePreference } from "../../lib/language";
import { getT } from "../../lib/i18n/server";
import ShareShloka from "./ShareShloka";

/**
 * Home page "Today's Shloka" — a new verse each day (India date). The
 * meaning follows the navbar language choice (ಕನ್ನಡ → Kannada meaning),
 * like the book filter; the verse itself is always Devanagari.
 */
export default async function DailyShloka() {
  const t = await getT();
  const kannada = (await getLanguagePreference()).toLowerCase() === "kannada";
  const { shloka } = shlokaForToday();
  const meaning = kannada ? shloka.meaning.kn : shloka.meaning.en;
  const source = kannada ? shloka.source.kn : shloka.source.en;

  return (
    <section className="daily-shloka" aria-labelledby="daily-shloka-title">
      <div className="daily-shloka__card">
        <p id="daily-shloka-title" className="daily-shloka__label">
          🪔 {t("shloka.title")}
        </p>

        <blockquote className="daily-shloka__verse" lang="sa">
          {shloka.lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </blockquote>

        <p className="daily-shloka__source" lang={kannada ? "kn" : "en"}>
          — {source}
        </p>

        <div className="daily-shloka__divider" aria-hidden="true" />

        <p className="daily-shloka__meaning" lang={kannada ? "kn" : "en"}>
          <strong>{kannada ? "ಅರ್ಥ" : "Meaning"}:</strong> {meaning}
        </p>

        <ShareShloka
          text={`🪔 ${kannada ? "ಇಂದಿನ ಶ್ಲೋಕ" : "Today's Shloka"}\n\n${shloka.lines.join("\n")}\n— ${source}\n\n${meaning}`}
          label={t("shloka.share")}
        />
      </div>
    </section>
  );
}
