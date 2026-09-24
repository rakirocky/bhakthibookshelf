import { BookMarked, Zap, ShieldCheck, Sparkles } from "lucide-react";

export default function WhyChooseUs() {
  return (
    <section className="why-choose">

      <div className="container">

        <div className="section-header">

          <h2>Why Choose Bhakthi Bookshelf?</h2>

          <p>
            A trusted destination for spiritual seekers and devotees.
          </p>

        </div>

        <div className="why-grid">

          <div className="why-card">
            <div className="why-icon"><BookMarked /></div>
            <h3>Authentic Scriptures</h3>

            <p>
              Carefully curated devotional books from trusted sources.
            </p>
          </div>

          <div className="why-card" data-web-only>
            <div className="why-icon"><Zap /></div>
            <h3>Instant Downloads</h3>

            <p>
              Purchase today and download immediately after payment.
            </p>
          </div>

          <div className="why-card" data-web-only>
            <div className="why-icon"><ShieldCheck /></div>
            <h3>Secure Payments</h3>

            <p>
              Safe and reliable online payment experience.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon"><Sparkles /></div>
            <h3>Spiritual Growth</h3>

            <p>
              Build your personal digital library of sacred knowledge.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}