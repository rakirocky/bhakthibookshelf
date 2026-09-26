import Footer from "../components/layout/Footer";
import WishlistClient from "./WishlistClient";
import { pageMetadata } from "../lib/seo/pageMetadata";

export const metadata = {
  ...pageMetadata("My Wishlist", "Books you've saved for later on Bhakthi Bookshelf.", "/wishlist"),
  robots: { index: false },
};

export default function WishlistPage() {
  return (
    <>
      <main className="books-page wishlist-page">
        <WishlistClient />
      </main>
      <Footer />
    </>
  );
}
