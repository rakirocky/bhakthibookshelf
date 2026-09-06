import Image from "next/image";

import Footer from "../components/layout/Footer";

export default function AboutPage() {
  return (
    <>

      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fffdf7",
          padding: "20px",
        }}
      >
        <Image
          src="/images/about-wallpaper.jpg"
          alt="About Bhakthi Bookshelf"
          width={1400}
          height={1980}
          priority
          style={{
            width: "100%",
            maxWidth: 900,
            height: "auto",
            borderRadius: 8,
            boxShadow: "0 20px 60px rgba(0,0,0,.15)",
          }}
        />
      </main>

      <Footer />
    </>
  );
}
