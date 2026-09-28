import Footer from "../components/layout/Footer";
import { getT, getUiLang } from "@/app/lib/i18n/server";
import type { I18nKey } from "@/app/lib/i18n/dictionary";
import { pageMetadata } from "@/app/lib/seo/pageMetadata";

export const metadata = pageMetadata(
  "About Us",
  "Meet the team behind Bhakthi Bookshelf — managing partners, technology, digital and the content creators who prepare every book.",
  "/about-us"
);

// The people behind Bhakthi Bookshelf (client-supplied, 2026-09-27;
// Kannada spellings, no dots — 2026-09-28; initials before or after the
// name per person, as the client wants).
type Person = { en: string; kn: string };
const TEAM: { role: I18nKey; people: Person[] }[] = [
  {
    role: "about.role.partner",
    people: [
      { en: "Siddhartha S S", kn: "ಸಿದ್ಧಾರ್ಥ ಎಸ್ ಎಸ್" },
      { en: "H M Vishwa Bandhu Priyadarshi", kn: "ಹೆಚ್ ಎಂ ವಿಶ್ವ ಬಂಧು ಪ್ರಿಯದರ್ಶಿ" },
    ],
  },
  { role: "about.role.tech", people: [{ en: "Lakshmikanth", kn: "ಲಕ್ಷ್ಮೀಕಾಂತ್" }] },
  { role: "about.role.digital", people: [{ en: "Manjesh U", kn: "ಮಂಜೇಶ್ ಯು" }] },
  {
    role: "about.role.content",
    people: [
      { en: "H M Bharathi Priyadarshini", kn: "ಹೆಚ್ ಎಂ ಭಾರತಿ ಪ್ರಿಯದರ್ಶಿನಿ" },
      { en: "H M Nandini Priyadarshini", kn: "ಹೆಚ್ ಎಂ ನಂದಿನಿ ಪ್ರಿಯದರ್ಶಿನಿ" },
      { en: "H M Indira Priyadarshini", kn: "ಹೆಚ್ ಎಂ ಇಂದಿರಾ ಪ್ರಿಯದರ್ಶಿನಿ" },
      { en: "Vinutha P", kn: "ವಿನುತ ಪಿ" },
    ],
  },
];

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Avatar letter: first character of the given name, skipping initials
 *  written before it (counted from the English form — a Kannada initial
 *  like ಹೆಚ್ is several characters). Grapheme-aware so ವಿ stays whole. */
function avatarLetter(en: string, display: string) {
  const words = en.split(" ");
  let skip = 0;
  while (skip < words.length - 1 && words[skip].length === 1) skip++;
  const given = display.split(" ")[skip] ?? display;
  return segmenter.segment(given)[Symbol.iterator]().next().value?.segment.toUpperCase() ?? "";
}

export default async function AboutUsPage() {
  const t = await getT();
  const lang = await getUiLang();

  return (
    <>
      <main>
        {/* ===== Hero — same navy band as Our Vision / Contact ===== */}
        <section className="about-us-hero">
          <p className="about-us-hero__eyebrow">{t("about.teamEyebrow")}</p>
          <h1 style={{ color: "var(--color-white)" }}>{t("about.us")}</h1>
          <p>{t("about.teamIntro")}</p>
        </section>

        {/* ===== The team — card pulled up over the hero ===== */}
        <section
          className="content-section about-sacred about-team"
          aria-label={t("about.us")}
        >
          {TEAM.map((group) => (
            <div key={group.role} className="about-team__group">
              <h2>{t(group.role)}</h2>
              <ul className="about-team__grid">
                {group.people.map((person) => {
                  const name = lang === "kn" ? person.kn : person.en;
                  return (
                  <li key={person.en} className="about-team__card">
                    <span className="about-team__avatar" aria-hidden="true">
                      {avatarLetter(person.en, name)}
                    </span>
                    <strong>{name}</strong>
                  </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}
