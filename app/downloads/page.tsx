import DownloadsClient from "../components/books/DownloadsClient";
import Footer from "../components/layout/Footer";

export const metadata = {
  title: "Downloads | Bhakthi Bookshelf",
  description:
    "Read your purchased books offline, on this device, in the Bhakthi Bookshelf reader.",
};

export default function DownloadsPage() {
  return (
    <>
      <DownloadsClient />
      <Footer />
    </>
  );
}
