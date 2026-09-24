import Image from "next/image";

import Footer from "../components/layout/Footer";

export default function AboutPage() {
  return (
    <>
      <main>
        {/* ===== Hero — same navy/gold medallion treatment as Contact ===== */}
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
                style={{ borderRadius: "50%", display: "block" }}
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
            About Bhakthi Bookshelf
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              maxWidth: 480,
              margin: "0 auto",
              position: "relative",
            }}
          >
            A home for devotional reading.
          </p>
        </section>

        {/* ===== Content — card pulled up over the hero for depth ===== */}
        <section
          className="content-section"
          style={{
            maxWidth: 780,
            margin: "-50px auto 60px",
            padding: "0 20px",
            position: "relative",
            lineHeight: 1.9,
            background: "var(--color-white)",
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(0,0,0,.12)",
          }}
        >
          <div style={{ padding: "40px 30px 10px" }}>
            <Image
              src="/images/about-banner-kannada.svg"
              alt=""
              width={1200}
              height={560}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 10,
                marginBottom: 30,
              }}
            />
          </div>

          <div style={{ padding: "0 30px" }}>
          <h2 lang="kn">ನಮಸ್ಕಾರ ಬಂಧುಗಳೇ</h2>
          <p lang="kn">
            ನಮ್ಮ ಹಿಂದೂ ಧರ್ಮವು ಪ್ರಪಂಚದ ಅತ್ಯಂತ ಪುರಾತನವಾದ, ಪ್ರಮುಖವಾದ
            ಧರ್ಮಗಳಲ್ಲಿ ಒಂದು. ಇದನ್ನು ಸನಾತನ ಧರ್ಮ ಅಥವಾ ವೈಧಿಕ ಧರ್ಮ ಎಂದು ಸಹ
            ಕರೆಯುತ್ತಾರೆ. ಇದು ವೇದಗಳು, ಉಪನಿಷತ್ತುಗಳು, ಪುರಾಣ, ಭಗವದ್ಗೀತೆ
            ಯಂತಹ ಪವಿತ್ರ ಗ್ರಂಥಗಳ ಬೋಧನೆಗಳ ಮೇಲೆ ಆಧಾರಿತವಾಗಿದೆ. ಹಿಂದೂ ಧರ್ಮವು
            ವೈವಿಧ್ಯಮಯ ನಂಬಿಕೆಗಳು, ತತ್ವಗಳು ಮತ್ತು ಆಚರಣೆಗಳನ್ನು ಒಳಗೊಂಡಿರುವ
            ಒಂದು ಜೀವನ ಪದ್ಧತಿಯಾಗಿದೆ.
          </p>
          <p lang="kn">
            ನಾವು ಇಂದಿನ ಮತ್ತು ಮುಂದಿನ ಪೀಳಿಗೆಯ ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆ,
            ವಿಚಾರಧಾರೆಗೆ ಹೆಚ್ಚು ಒತ್ತು ಕೊಡುವ ಎಲ್ಲ ಓದುಗ ಮನಸ್ಸುಗಳನ್ನು
            ಗಮನದಲ್ಲಿರಿಸಿಕೊಂಡು &ldquo;BHAKTHI BOOKSHELF&rdquo; — A home for
            devotional reading ಎಂಬ E-BOOK ಸೇವೆಯನ್ನು ಪರಿಚಯಿಸುತ್ತಿದ್ದೇವೆ.
          </p>

          <h2 lang="kn">ಉದ್ದೇಶಗಳು</h2>
          <p lang="kn">
            ನಮ್ಮ ಹಿಂದೂ ಧರ್ಮದ ಇತಿಹಾಸ, ಸಂಸ್ಕೃತಿ, ಅದರ ಹಿರಿಮೆ, ಪರಂಪರೆ ಹಾಗೂ
            ನಮ್ಮ ದೇಶದ ವಿವಿಧ ಸ್ಥಳಗಳ ಮಹಿಮೆ, ದೇವಾಲಯಗಳ ಪರಿಚಯ ಮತ್ತು
            ವಿಶೇಷತೆ, ಸಕರಾತ್ಮಕತೆ ಬಿತ್ತುವ, ಮನಸ್ಸಿಗೆ ಶಾಂತಿ ಮತ್ತು ಮುದ
            ನೀಡುವಂತಹ ಶ್ಲೋಕಗಳು, ದೇವರ ನಾಮಗಳು ಹಾಗೂ ಹಬ್ಬಗಳ ಆಚರಣೆ, ಮಹತ್ವ
            ಮತ್ತು ಅದರ ವೈಶಿಷ್ಟ್ಯತೆ ಇತ್ಯಾದಿಗಳ ಕುರಿತು ಮಾಹಿತಿಗಳನ್ನು
            ಒದಗಿಸುವ ಸೇವೆಯೇ &ldquo;BHAKTHI BOOKSHELF&rdquo; E-BOOK.
          </p>

          <h2 lang="kn">ವಿಶೇಷತೆ</h2>
          <p lang="kn">
            ಯಾವುದೇ ವಿಷಯವು 12-30 ಪುಟಗಳಿದ್ದು, ಸುಲಭವಾಗಿ ಎಲ್ಲರಿಗೂ
            ಅರ್ಥವಾಗುವ ರೀತಿಯಲ್ಲಿ ಚಿತ್ರಗಳ ಸಹಿತ ಸಿದ್ದಪಡಿಸಲಾಗಿರುತ್ತದೆ. ಇದು
            ಓದುಗರ ಸಮಯವನ್ನು ಉಳಿತಾಯ ಮಾಡುವುದರ ಜೊತೆಗೆ ಮನಸ್ಸಿಗೆ ಹಿತವಾದ
            ನೆಮ್ಮದಿಯ ಭಾವ ಮೂಡಿಸುತ್ತದೆ.
          </p>
          <p lang="kn">
            ಈ ಪ್ರಯತ್ನಕ್ಕೆ ನಿಮ್ಮೆಲ್ಲರ ಪ್ರೋತ್ಸಾಹ ಮತ್ತು ಸಹಕಾರ ನಮ್ಮ
            ಮೇಲಿರಲಿ.
            <br />
            ಧನ್ಯವಾದಗಳು
          </p>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--color-border)",
              margin: "40px 0",
            }}
          />
          </div>

          <div style={{ padding: "0 30px" }}>
            <Image
              src="/images/about-banner-english.svg"
              alt=""
              width={1200}
              height={560}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 10,
                marginBottom: 30,
              }}
            />
          </div>

          <div style={{ padding: "0 30px" }}>
          <h2>Hello Friends</h2>
          <p>
            Our Hindu religion is one of the oldest and most important
            religions of the world. It is also called Sanatana Dharma or
            Vedic religion. It is based on the teachings of sacred
            scriptures like the Vedas, Upanishads, Puranas, and the
            Bhagavad Gita. Hinduism is a way of life that encompasses a
            variety of beliefs, principles, and practices.
          </p>
          <p>
            Keeping in mind all the readers who give more emphasis to
            spiritual thinking and ideology — for today&rsquo;s and the
            next generation — we are introducing the e-book service
            called &ldquo;Bhakthi Bookshelf&rdquo; — a home for devotional
            reading.
          </p>

          <h2>Objectives</h2>
          <p>
            Bhakthi Bookshelf is a service that provides information
            about the history, culture, greatness, and heritage of our
            Hindu religion; the glory of various places in our country;
            an introduction to temples and their speciality; hymns that
            sow positivity and bring peace and comfort to the mind; and
            the celebration of festivals, their importance, and their
            speciality.
          </p>

          <h2>Speciality</h2>
          <p>
            Every topic is 12&ndash;30 pages long, prepared with pictures
            in a way that is easy for everyone to understand. This saves
            the reader&rsquo;s time while creating a pleasant and peaceful
            feeling in the mind.
          </p>
          <p style={{ paddingBottom: 30 }}>
            May all of you encourage and co-operate with us in this
            effort.
            <br />
            Thank you
          </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
