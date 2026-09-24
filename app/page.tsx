import { Cinzel, Marcellus, Noto_Serif, Noto_Serif_Kannada } from "next/font/google";

import Hero from "./components/home/Hero";
import FeaturedBooks from "./components/home/FeaturedBooks";
import WhyChooseUs from "./components/home/WhyChooseUs";
import Newsletter from "./components/home/Newsletter";
import Footer from "./components/layout/Footer";
import Statistics from "./components/home/Statistics";
import ThemePreviewBar from "./components/home/ThemePreviewBar";

// Featured Books reads live data from the DB, and this page should never
// be frozen as static HTML at build time — see the same note in
// app/admin/layout.tsx.
export const dynamic = "force-dynamic";

// Design trial fonts (only used by the ?theme= variants below).
const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-cinzel" });
const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus" });
const notoSerif = Noto_Serif({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-noto-serif" });
const notoSerifKannada = Noto_Serif_Kannada({ subsets: ["kannada"], weight: ["400", "600"], variable: "--font-noto-serif-kn" });

// Design comparison (owner request, 2026-09-25): ?theme=manuscript (A)
// or ?theme=aarti (B); no param keeps the current .home-sacred look.
const THEMES: Record<string, string> = {
  manuscript: "home-manuscript",
  aarti: "home-aarti",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const { theme } = await searchParams;
  const variant = theme ? THEMES[theme] : undefined;
  const fonts = variant
    ? [cinzel, marcellus, notoSerif, notoSerifKannada].map((f) => f.variable).join(" ")
    : "";

  return (
   <>
  {theme !== undefined && <ThemePreviewBar current={theme} />}

  {/* home-sacred: spiritual theme (home.css) — trial on the home page
      before rolling it out to other pages. */}
  <div className={variant ? `${variant} ${fonts}` : "home-sacred"}>
    <Hero />

    <FeaturedBooks />

    <Statistics />

    <WhyChooseUs />

    <Newsletter />
  </div>

  <Footer />
</>
  );
}
