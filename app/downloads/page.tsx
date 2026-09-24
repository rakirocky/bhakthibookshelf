import DownloadsClient from "../components/books/DownloadsClient";
import Footer from "../components/layout/Footer";
import { getCustomerSession } from "../lib/auth/getCustomerSession";
import { OrderService } from "../lib/services/orderService";

export const metadata = {
  title: "Downloads | Bhakthi Bookshelf",
  description:
    "Read your purchased books offline, on this device, in the Bhakthi Bookshelf reader.",
};

export default async function DownloadsPage() {
  const session = await getCustomerSession();

  const purchased = session
    ? (
        await OrderService.getPurchasedBooksForCustomer(
          session.customerId
        )
      ).map((b: { id: number; slug: string; title: string; author: string }) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        author: b.author,
      }))
    : [];

  return (
    <>
      <DownloadsClient purchased={purchased} />
      <Footer />
    </>
  );
}
