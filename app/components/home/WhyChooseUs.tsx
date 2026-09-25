import { BookMarked, Zap, ShieldCheck, Sparkles } from "lucide-react";

import { getT } from "../../lib/i18n/server";

export default async function WhyChooseUs() {
  const t = await getT();

  return (
    <section className="why-choose">

      <div className="container">

        <div className="section-header">

          <h2>{t("why.title")}</h2>

          <p>
            {t("why.subtitle")}
          </p>

        </div>

        <div className="why-grid">

          <div className="why-card">
            <div className="why-icon"><BookMarked /></div>
            <h3>{t("why.authentic")}</h3>

            <p>
              {t("why.authenticText")}
            </p>
          </div>

          <div className="why-card" data-web-only>
            <div className="why-icon"><Zap /></div>
            <h3>{t("why.instant")}</h3>

            <p>
              {t("why.instantText")}
            </p>
          </div>

          <div className="why-card" data-web-only>
            <div className="why-icon"><ShieldCheck /></div>
            <h3>{t("why.secure")}</h3>

            <p>
              {t("why.secureText")}
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon"><Sparkles /></div>
            <h3>{t("why.growth")}</h3>

            <p>
              {t("why.growthText")}
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}