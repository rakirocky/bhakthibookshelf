import Hero from "./components/home/Hero";
import FeaturedBooks from "./components/home/FeaturedBooks";
import WhyChooseUs from "./components/home/WhyChooseUs";
import Newsletter from "./components/home/Newsletter";
import Footer from "./components/layout/Footer";
import Statistics from "./components/home/Statistics";
import ContinueReading from "./components/books/ContinueReading";
import DailyShloka from "./components/home/DailyShloka";

// Featured Books reads live data from the DB, and this page should never
// be frozen as static HTML at build time — see the same note in
// app/admin/layout.tsx.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
   <>
  {/* home-sacred: the home page's spiritual theme (home.css) */}
  <div className="home-sacred">
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
