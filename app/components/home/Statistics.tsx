import Container from "../ui/Container";
import SectionHeader from "../ui/SectionHeader";
import StatCard from "../ui/StatCard";

export default function Statistics() {
  return (
    <section className="statistics">
      <Container>
        <SectionHeader
          title="Our Promise"
          subtitle="Every book we publish is chosen with devotion, authenticity and the desire to share timeless spiritual wisdom."
        />

        <div className="stats-grid">
          <StatCard
            icon="📚"
            number="Curated"
            label="A carefully selected collection of devotional books."
          />

          <StatCard
            icon="🙏"
            number="Authentic"
            label="Rooted in the timeless teachings of Sanatana Dharma."
          />

          <StatCard
            icon="⚡"
            number="Instant"
            label="Download your books immediately after purchase."
          />

          <StatCard
            icon="🌍"
            number="Anywhere"
            label="Read your spiritual library on all your favorite devices."
          />
        </div>
      </Container>
    </section>
  );
}