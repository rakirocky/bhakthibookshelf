import Footer from "../components/layout/Footer";
import { SettingsService } from "@/app/lib/services/settingsService";

export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
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
          <h1>Privacy Policy</h1>
          <p>Last updated: {lastUpdated}</p>
        </section>

        <section
          className="content-section"
          style={{ maxWidth: 780, margin: "0 auto 60px", lineHeight: 1.8 }}
        >
          <p>
            {storeName} ("we", "us", "our") operates this website to
            provide devotional e-books and related digital content. This
            policy explains what information we collect, how we use it,
            and the choices you have.
          </p>

          <h2>1. Information We Collect</h2>
          <p>When you create an account, place an order, or subscribe, we collect:</p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>Name, phone number, and email address</li>
            <li>Billing address (city, state, pincode, country)</li>
            <li>GST number, if you provide one for invoicing</li>
            <li>Order history and subscription status</li>
            <li>A securely hashed password (we never store your password in plain text, and cannot see it)</li>
          </ul>
          <p>
            We also automatically collect basic technical information —
            such as your browser type and IP address — through standard
            web server logs, and a small amount of preference data
            (like your chosen content language) through cookies.
          </p>

          <h2>2. How We Use Your Information</h2>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>To create and manage your account</li>
            <li>To process orders and subscriptions, and to send order confirmations and invoices</li>
            <li>To grant you access to books you've purchased or subscribed to</li>
            <li>To respond to support requests you send us</li>
            <li>To notify you about new releases or offers, if you have an account with us</li>
            <li>To improve the site and diagnose technical issues</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>

          <h2>3. Cookies</h2>
          <p>
            We use cookies for essential site functions: keeping you
            logged in, remembering your cart, remembering your language
            preference, and — where applicable — recognizing that you
            arrived via a referral link. We do not use cookies for
            third-party advertising.
          </p>

          <h2>4. Payment Information</h2>
          <p>
            We do not store your card, UPI, or banking details on our
            servers. Payments, once enabled, are processed by a
            third-party payment gateway that handles your payment
            information according to its own security standards and
            policies.
          </p>

          <h2>5. Data Sharing</h2>
          <p>
            We share your information only where necessary to operate
            the service — for example, with our payment gateway to
            process a transaction, or with our email provider to send
            you an invoice or order update. We do not share your data
            with third parties for their own marketing purposes.
          </p>

          <h2>6. Data Security</h2>
          <p>
            We take reasonable technical measures to protect your data,
            including encrypted password storage and secured
            administrative access. No online service can guarantee
            perfect security, but we work to protect your information
            against unauthorized access, alteration, or disclosure.
          </p>

          <h2>7. Your Rights</h2>
          <p>
            You can view and update your account details, and change
            your password, at any time from your account page. To
            request a copy of your data, or to request that we delete
            your account, contact us using the details below.
          </p>

          <h2>8. Children's Privacy</h2>
          <p>
            This service is not directed at children under 13, and we
            do not knowingly collect personal information from children
            under 13.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. The "Last
            updated" date at the top of this page reflects the most
            recent revision.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this policy or how your data is
            handled, reach us at:
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
