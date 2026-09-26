import Footer from "../components/layout/Footer";
import { SettingsService } from "@/app/lib/services/settingsService";
import { getT, getUiLang } from "@/app/lib/i18n/server";
import { pageMetadata } from "@/app/lib/seo/pageMetadata";

export const metadata = pageMetadata(
  "Privacy Policy",
  "How Bhakthi Bookshelf collects, uses and protects your personal information.",
  "/privacy-policy"
);

export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
  const t = await getT();
  const uiLang = await getUiLang();
  const settings = await SettingsService.getSettings();

  const storeName = settings.store_name || "Bhakthi Bookshelf";
  const email = settings.contact_email || "BhakthiBookshelf@gmail.com";
  const phone = settings.contact_phone || "+91 78921 19482";
  const address = settings.address;
  // these sections only appear once the service is switched on (env keys)
  const analyticsOn = Boolean(process.env.GA_MEASUREMENT_ID);
  const monitoringOn = Boolean(process.env.SENTRY_DSN);

  const lastUpdated = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <main className="page-container">
        <section className="page-header">
          <h1>{t("legal.privacy")}</h1>
          <p>{t("legal.updated", { date: lastUpdated })}</p>
          {uiLang === "kn" && (
            <p lang="kn" style={{ fontSize: 14, color: "var(--color-warning-text)" }}>
              {t("legal.englishNote")}
            </p>
          )}
        </section>

        <section
          className="content-section"
          style={{ maxWidth: 780, margin: "0 auto 60px", lineHeight: 1.8 }}
        >
          <p>
            {storeName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates this website to
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

          <h2>1a. In the Mobile App</h2>
          <p>
            If you download a book for offline reading in the Bhakthi
            Bookshelf app, your device generates a random device identifier
            (not derived from any hardware serial number) so we can tell
            your devices apart and enforce the device limit for downloads.
            That identifier, and a record of which books are licensed to
            each device, is stored on our servers. The book file itself is
            encrypted and stored only on your device — we do not receive a
            copy of it, and it is never uploaded anywhere.
          </p>

          <h2>2. How We Use Your Information</h2>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>To create and manage your account</li>
            <li>To process orders and subscriptions, and to send order confirmations and invoices</li>
            <li>To grant you access to books you&rsquo;ve purchased or subscribed to</li>
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
            {analyticsOn &&
              " We also use Google Analytics cookies to understand, in aggregate, how visitors use the site (see section 3a)."}
          </p>

          {(analyticsOn || monitoringOn) && (
            <>
              <h2>3a. Analytics and Error Monitoring</h2>
              {analyticsOn && (
                <p>
                  We use Google Analytics to count visits and see which
                  pages and books are popular, where visitors come from
                  (for example a search engine or a shared link), and
                  whether key steps such as adding a book to the cart or
                  completing a purchase work well. Google Analytics uses
                  cookies and receives technical data such as your
                  browser, device type, approximate location (city level)
                  and pages visited. We do not send it your name, phone
                  number, email address or payment details. You can opt
                  out with Google&rsquo;s browser add-on at
                  tools.google.com/dlpage/gaoptout, or by blocking cookies
                  in your browser.
                </p>
              )}
              {monitoringOn && (
                <p>
                  When something goes wrong on the site or in the app, a
                  technical error report — the error message, the page
                  address and your browser type — is sent to our error
                  monitoring service (Sentry) so we can fix it quickly.
                  These reports do not include your name, phone number,
                  email address, payment details or the contents of your
                  books.
                </p>
              )}
            </>
          )}

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
            you an invoice or order update
            {analyticsOn && monitoringOn
              ? ", and with Google Analytics and Sentry as described in section 3a"
              : analyticsOn
                ? ", and with Google Analytics as described in section 3a"
                : monitoringOn
                  ? ", and with Sentry as described in section 3a"
                  : ""}
            . We do not share your data with third parties for their
            own marketing purposes.
          </p>

          <h2>6. Data Security</h2>
          <p>
            We take reasonable technical measures to protect your data,
            including encrypted password storage and secured
            administrative access. No online service can guarantee
            perfect security, but we work to protect your information
            against unauthorized access, alteration, or disclosure.
          </p>

          <h2 id="your-rights">7. Your Rights</h2>
          <p>
            You can view and update your account details, and change
            your password, at any time from your account page. To
            request a copy of your data, or to request that we delete
            your account — including any device records and download
            licences tied to the mobile app — contact us using the
            details below. We&rsquo;ll confirm the deletion by email once
            it&rsquo;s done.
          </p>

          <h2>8. Children&rsquo;s Privacy</h2>
          <p>
            This service is not directed at children under 13, and we
            do not knowingly collect personal information from children
            under 13.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. The &ldquo;Last
            updated&rdquo; date at the top of this page reflects the most
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
