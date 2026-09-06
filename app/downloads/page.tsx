import DownloadsClient from "../components/books/DownloadsClient";
import Footer from "../components/layout/Footer";

export const metadata = {
  title: "Downloads | Bhakthi Bookshelf",
  description:
    "Read your purchased books offline in the Bhakthi Bookshelf app.",
};

/**
 * Inside the app this is the offline library (DownloadsClient). On the
 * website there is nothing stored locally, so it shows the explainer.
 */
export default function DownloadsPage() {
  return (
    <>
      <DownloadsClient
        fallback={
          <main
            style={{
              minHeight: "60vh",
              maxWidth: 560,
              margin: "0 auto",
              padding: "48px 20px",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontSize: 26,
                color: "var(--color-navy)",
                marginBottom: 12,
              }}
            >
              Your offline library
            </h1>
            <p
              style={{
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
              }}
            >
              Downloaded books are stored securely on your device and can be
              read offline inside the Bhakthi Bookshelf app. Open the app on
              your phone or tablet, go to a book you own, and tap{" "}
              <strong>Save for offline reading</strong> to add it here.
            </p>
          </main>
        }
      />

      <Footer />
    </>
  );
}
