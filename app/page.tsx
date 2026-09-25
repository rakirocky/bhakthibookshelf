import Hero from "./components/home/Hero";
import FeaturedBooks from "./components/home/FeaturedBooks";
import WhyChooseUs from "./components/home/WhyChooseUs";
import Newsletter from "./components/home/Newsletter";
import Footer from "./components/layout/Footer";
import Statistics from "./components/home/Statistics";
import ContinueReading from "./components/books/ContinueReading";
import DailyShloka from "./components/home/DailyShloka";
import JsonLd from "./lib/seo/JsonLd";
import { SITE_URL, absoluteUrl } from "./lib/seo/siteUrl";

export const metadata = {
  alternates: { canonical: "/" },
};

// Lets Google show the site name properly and a search box that lands on
// the Library's ?q= search.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "Bhakthi Bookshelf",
      inLanguage: ["en-IN", "kn-IN"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/books?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Bhakthi Bookshelf",
      url: `${SITE_URL}/`,
      logo: absoluteUrl("/images/logo.png"),
    },
  ],
};

// Featured Books reads live data from the DB, and this page should never
// be frozen as static HTML at build time — see the same note in
// app/admin/layout.tsx.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
   <>
  {/* home-sacred: the home page's spiritual theme (home.css) */}
  <div className="home-sacred">
    <JsonLd data={siteJsonLd} />
    <Hero />

    {/* only renders once a book has been opened in the reader */}
    <section className="home-continue">
      <ContinueReading compact />
    </section>

    <DailyShloka />

    <FeaturedBooks />

    <Statistics />

    <WhyChooseUs />

    <Newsletter />
  </div>

  <Footer />
</>
  );
}
