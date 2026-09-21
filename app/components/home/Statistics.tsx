import { BookOpen, Users, Zap, ShieldCheck } from "lucide-react";

import Container from "../ui/Container";
import SectionHeader from "../ui/SectionHeader";
import StatCard from "../ui/StatCard";

import { getSiteStats } from "../../lib/services/site-stats-service";

export default async function Statistics() {
  const { bookCount, customerCount } = await getSiteStats();

  return (
    <section className="statistics">
      <Container>
        <SectionHeader
          title="Our Promise"
          subtitle="Every book we publish is chosen with devotion, authenticity and the desire to share timeless spiritual wisdom."
        />

        <div className="stats-grid">
          <StatCard
            icon={<BookOpen />}
            number={`${bookCount}+`}
            label="Devotional books in our growing library."
          />

          <StatCard
            icon={<Users />}
            number={`${customerCount}+`}
            label="Readers who've joined Bhakthi Bookshelf."
          />

          <StatCard
            icon={<Zap />}
            number="Instant"
            label="Download your books immediately after purchase."
          />

          <StatCard
            icon={<ShieldCheck />}
            number="Secure"
            label="Safe, encrypted payments on every order."
          />
        </div>
      </Container>
    </section>
  );
}