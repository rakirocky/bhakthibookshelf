import Hero from "./components/home/Hero";
import FeaturedBooks from "./components/home/FeaturedBooks";
import WhyChooseUs from "./components/home/WhyChooseUs";
import Newsletter from "./components/home/Newsletter";
import Footer from "./components/layout/Footer";
import Statistics from "./components/home/Statistics";

// Featured Books reads live data from the DB, and this page should never
// be frozen as static HTML at build time — see the same note in
// app/admin/layout.tsx.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
   <>

  <Hero />

  <FeaturedBooks />

  <Statistics />

  <WhyChooseUs />

  <Newsletter />

  <Footer />
</>
  );
}
