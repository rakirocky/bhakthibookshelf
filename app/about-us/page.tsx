import Footer from "../components/layout/Footer";
import { getT } from "@/app/lib/i18n/server";
import type { I18nKey } from "@/app/lib/i18n/dictionary";
import { pageMetadata } from "@/app/lib/seo/pageMetadata";

export const metadata = pageMetadata(
  "About Us",
  "Meet the team behind Bhakthi Bookshelf — managing partners, technology, digital and the content creators who prepare every book.",
  "/about-us"
);

// The people behind Bhakthi Bookshelf (client-supplied, 2026-09-27).
// Names stay in English script in both languages; roles are translated.
const TEAM: { role: I18nKey; people: string[] }[] = [
  {
    role: "about.role.partner",
    people: ["Siddhartha S.S", "Vishwa Bandu Priyadarshi H.M"],
  },
  { role: "about.role.tech", people: ["Lakshmikanth"] },
  { role: "about.role.digital", people: ["Manjesh"] },
  {
    role: "about.role.content",
    people: [
      "Bharathi Priyadarshini H.M",
      "Nandini Priyadarshini H.M",
      "Indira Priyadarshini H.M",
      "Vinutha P",
    ],
  },
];

function initials(name: string) {
  return name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default async function AboutUsPage() {
  const t = await getT();

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
                {group.people.map((name) => (
                  <li key={name} className="about-team__card">
                    <span className="about-team__avatar" aria-hidden="true">
                      {initials(name)}
                    </span>
                    <strong>{name}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}
