import Image from "next/image";

import Footer from "../components/layout/Footer";
import ContactForm from "../components/contact/ContactForm";
import { PhoneIcon, MailIcon, ClockIcon, PinIcon } from "../components/ui/Icons";
import { SettingsService } from "@/app/lib/services/settingsService";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await SettingsService.getSettings();

  return (
    <>
      <main>
        {/* ===== Hero — two-tone, logo as a real focal point ===== */}
        <section
          style={{
            background:
              "linear-gradient(135deg, var(--color-navy) 0%, #142a5c 100%)",
            padding: "70px 20px 90px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* soft glow behind the logo */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 340,
              height: 340,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(217,119,6,0.35) 0%, rgba(217,119,6,0) 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "inline-flex",
              padding: 8,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--color-primary), var(--color-accent-gold))",
              marginBottom: 26,
              boxShadow: "0 12px 40px rgba(0,0,0,.35)",
            }}
          >
            <div
              style={{
                background: "var(--color-white)",
                borderRadius: "50%",
                padding: 10,
              }}
            >
              <Image
                src="/images/logo.png"
                alt="Bhakthi Bookshelf"
                width={130}
                height={130}
                style={{
                  borderRadius: "50%",
                  display: "block",
                }}
                priority
              />
            </div>
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              color: "var(--color-white)",
              position: "relative",
            }}
          >
            Contact Us
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              maxWidth: 480,
              margin: "0 auto",
              position: "relative",
            }}
          >
            We'd love to hear from you — questions, feedback, or just to
            say namaste.
          </p>
        </section>

        {/* ===== Content — cards pulled up over the hero for depth ===== */}
        <section
          style={{
            maxWidth: 1100,
            margin: "-50px auto 0",
            padding: "0 20px 70px",
            position: "relative",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 30,
          }}
        >
          {/* Get in touch card */}
          <div className="contact-card">
            <h2 style={{ marginTop: 0, marginBottom: 24 }}>
              Get in Touch
            </h2>

            <ContactInfoRow
              icon={<PhoneIcon color="var(--color-primary)" />}
              label="Phone"
              value={settings.contact_phone || "+91 90084 91459"}
              href={`tel:${settings.contact_phone || "+919008491459"}`}
            />

            <ContactInfoRow
              icon={<MailIcon color="var(--color-primary)" />}
              label="Email"
              value={
                settings.contact_email ||
                "BhakthiBookshelf@gmail.com"
              }
              href={`mailto:${
                settings.contact_email ||
                "BhakthiBookshelf@gmail.com"
              }`}
            />

            <ContactInfoRow
              icon={<ClockIcon color="var(--color-primary)" />}
              label="Office Hours"
              value="Monday – Saturday, 9:00 AM – 6:00 PM"
            />

            {settings.address && (
              <ContactInfoRow
                icon={<PinIcon color="var(--color-primary)" />}
                label="Address"
                value={settings.address}
              />
            )}

            <div
              style={{
                marginTop: 30,
                paddingTop: 24,
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                }}
              >
                Social media links coming soon.
              </p>
            </div>
          </div>

          {/* Message form card */}
          <div className="contact-card">
            <h2 style={{ marginTop: 0, marginBottom: 24 }}>
              Send Us a Message
            </h2>

            <ContactForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function ContactInfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        marginBottom: 22,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          minWidth: 44,
          borderRadius: "50%",
          background: "var(--color-bg-page)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      <div>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </p>

        <p
          style={{
            margin: "2px 0 0",
            fontSize: 15,
            color: "var(--color-text)",
            fontWeight: 600,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} style={{ textDecoration: "none" }}>
        {content}
      </a>
    );
  }

  return content;
}
