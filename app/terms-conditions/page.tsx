import Footer from "../components/layout/Footer";
import { SettingsService } from "@/app/lib/services/settingsService";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const settings = await SettingsService.getSettings();

  const storeName = settings.store_name || "Bhakthi Bookshelf";
  const email = settings.contact_email || "BhakthiBookshelf@gmail.com";
  const phone = settings.contact_phone || "+91 90084 91459";
  const address = settings.address;

  const lastUpdated = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <main className="page-container">
        <section className="page-header">
          <h1>Terms &amp; Conditions</h1>
          <p>Last updated: {lastUpdated}</p>
        </section>

        <section
          className="content-section"
          style={{ maxWidth: 780, margin: "0 auto 60px", lineHeight: 1.8 }}
        >
          <p>
            These terms govern your use of {storeName} and the purchase
            of digital books and subscriptions through this website. By
            creating an account or placing an order, you agree to these
            terms.
          </p>

          <h2>1. Accounts</h2>
          <p>
            You need an account to purchase or download books. You're
            responsible for keeping your password confidential and for
            all activity under your account. Provide accurate
            information when you register, and let us know right away
            if you believe your account has been accessed without your
            permission.
          </p>

          <h2>2. Digital Products</h2>
          <p>
            All books sold through {storeName} are digital (e-book/PDF)
            products delivered electronically. We do not ship physical
            books. Once a book is available in your account, no
            physical shipping is involved or expected.
          </p>

          <h2>3. Purchases &amp; Payment</h2>
          <p>
            Prices are shown in Indian Rupees (₹) and may change without
            notice; the price at the time you complete an order is what
            applies to that order. Orders are confirmed once payment is
            verified.
          </p>

          <h2>4. Refunds &amp; Cancellations</h2>
          <p>
            Because our products are digital and become accessible
            immediately upon successful payment, <strong>we generally do
            not offer refunds once a book has been made available for
            download or a subscription has been activated</strong>. If
            you believe you were charged in error, or a file is
            corrupted or inaccessible, contact us within 7 days of
            purchase at the details below and we'll look into it.
          </p>

          <h2>5. Subscriptions</h2>
          <p>
            A subscription grants access to our full library of books,
            including titles added during your subscription period, for
            the duration stated at the time of purchase. Subscriptions
            do not renew automatically unless you're told otherwise at
            the time of purchase; access ends at the end of the paid
            period.
          </p>

          <h2>6. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>Share, resell, or redistribute books or your account access with others</li>
            <li>Copy, publish, or upload our content elsewhere without permission</li>
            <li>Attempt to bypass any access restrictions on our content</li>
            <li>Use the site for any unlawful purpose</li>
          </ul>

          <h2>7. Intellectual Property</h2>
          <p>
            All books, text, images, and branding on this site are owned
            by {storeName} or licensed to us, and are protected by
            copyright. Purchasing a book grants you a personal,
            non-transferable license to read it — it does not transfer
            ownership of the content itself.
          </p>

          <h2>8. Availability</h2>
          <p>
            We aim to keep the site available at all times but don't
            guarantee uninterrupted access. We may update, suspend, or
            discontinue features of the service at any time.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            {storeName} is provided on an "as is" basis. To the fullest
            extent permitted by law, we are not liable for indirect or
            consequential losses arising from your use of the site.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes
            will be subject to the jurisdiction of the courts where{" "}
            {storeName} is registered.
          </p>

          <h2>11. Changes to These Terms</h2>
          <p>
            We may revise these terms from time to time. Continued use
            of the site after a change means you accept the updated
            terms.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            Questions about these terms? Reach us at:
          </p>
          <p>
            {storeName}
            <br />
            Email: {email}
            <br />
            Phone: {phone}
            {address && (
              <>
                <br />
                {address}
              </>
            )}
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
