import { BookOpen, Users, Zap, ShieldCheck } from "lucide-react";

import Container from "../ui/Container";
import SectionHeader from "../ui/SectionHeader";
import StatCard from "../ui/StatCard";

import { getSiteStats } from "../../lib/services/site-stats-service";
import { getT } from "../../lib/i18n/server";

export default async function Statistics() {
  const { customerCount } = await getSiteStats();
  const t = await getT();

  return (
    <section className="statistics">
      <Container>
        <SectionHeader
          title={t("promise.title")}
          subtitle={t("promise.subtitle")}
        />

        <div className="stats-grid">
          <StatCard
            icon={<BookOpen />}
            number={t("promise.goal")}
            label={t("promise.goalText")}
          />

          <StatCard
            icon={<Users />}
            number={`${customerCount}+`}
            label={t("promise.readers")}
          />

          <StatCard
            webOnly
            icon={<Zap />}
            number={t("promise.instant")}
            label={t("promise.instantText")}
          />

          <StatCard
            webOnly
            icon={<ShieldCheck />}
            number={t("promise.secure")}
            label={t("promise.secureText")}
          />
        </div>
      </Container>
    </section>
  );
}