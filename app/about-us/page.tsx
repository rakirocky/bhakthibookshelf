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
// Kannada spellings, no dots, initials after the name — 2026-09-28).
type Person = { en: string; kn: string };
const TEAM: { role: I18nKey; people: Person[] }[] = [
  {
    role: "about.role.partner",
    people: [
      { en: "Siddhartha S S", kn: "ಸಿದ್ಧಾರ್ಥ ಎಸ್ ಎಸ್" },
      { en: "Vishwa Bandhu Priyadarshi H M", kn: "ವಿಶ್ವ ಬಂಧು ಪ್ರಿಯದರ್ಶಿ ಹೆಚ್ ಎಂ" },
    ],
  },
  { role: "about.role.tech", people: [{ en: "Lakshmikanth", kn: "ಲಕ್ಷ್ಮೀಕಾಂತ್" }] },
  { role: "about.role.digital", people: [{ en: "Manjesh U", kn: "ಮಂಜೇಶ್ ಯು" }] },
  {
    role: "about.role.content",
    people: [
      { en: "Bharathi Priyadarshini H M", kn: "ಭಾರತಿ ಪ್ರಿಯದರ್ಶಿನಿ ಹೆಚ್ ಎಂ" },
      { en: "Nandini Priyadarshini H M", kn: "ನಂದಿನಿ ಪ್ರಿಯದರ್ಶಿನಿ ಹೆಚ್ ಎಂ" },
      { en: "Indira Priyadarshini H M", kn: "ಇಂದಿರಾ ಪ್ರಿಯದರ್ಶಿನಿ ಹೆಚ್ ಎಂ" },
      { en: "Vinutha P", kn: "ವಿನುತ ಪಿ" },
    ],
  },
];

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Avatar letter: first character of the name. Grapheme-aware so a
 *  Kannada ವಿ stays whole. */
function avatarLetter(name: string) {
  return segmenter.segment(name)[Symbol.iterator]().next().value?.segment.toUpperCase() ?? "";
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
                      {avatarLetter(name)}
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
