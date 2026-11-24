# Play Console — Data Safety form

Answers for Play Console → **App content → Data safety**, worked out from what the code
actually does (not a guess) — `app/lib/repositories/customerRepository.ts`,
`database/migrations/009_customers.sql`, `013_orders_customer_link.sql`,
`016_newsletter_subscribers.sql`, `029_wishlist.sql`, `032_customer_account_deletion.sql`,
`app/lib/services/downloadService.ts`, `app/lib/razorpayClient.ts`,
`app/lib/services/emailService.ts`, `app/components/analytics/Analytics.tsx`,
`app/api/client-errors/route.ts`, and for Play Billing `app/lib/services/googlePlayService.ts`,
`app/lib/services/storePurchaseService.ts`, `database/migrations/037_store_purchases.sql`. Re-check this if the data model changes before you
submit — Play can suspend an app for a form that doesn't match reality.

Last reviewed **2026-11-24**: the Play Store app (1.9, versionCode 11) **sells books and
Lifetime Access through Google Play Billing**. Card/UPI/bank details are entered in Google
Play's own payment sheet and never reach the app or our server. For each purchase our
server receives from Google only the purchase token, the product ID (`book_<id>` /
`plan_1`), the Google order ID (`GPA.…`) and the purchase state, and stores them in
`store_purchases` + a normal order/subscription row (for the library, GST invoice and
refunds). In-app (Play) orders store **no postal address** — only the account's name,
phone and email on the invoice. Address/GST number are still listed below because website
orders of the same account show in the app's order history (over-declaring is safe).

> **The app loads the live website**, so a change on the server (for example adding the
> GA4 or Sentry keys) changes what the app collects **without a new APK**. Update this
> form in Play Console *before* switching either of those on — see "Analytics and crash
> reporting" below.

## First, the form-level questions

- **Does your app collect or share any of the required user data types?** → **Yes.**
- **Is all of the user data collected encrypted in transit?** → **Yes** — prod only
  serves over HTTPS (`bhakthibookshelf.in`); the release app refuses cleartext (only the
  debug/LAN-testing build allows it, and that never ships).
- **Do you provide a way for users to request that their data be deleted?** → **Yes.**
  - In the app: **My Account → Delete my account** (password + confirmation).
  - **Delete account URL** (Play asks for a web link that works without the app):
    `https://bhakthibookshelf.in/account/delete-account` — signs the user in first, then
    shows the same delete form. The Privacy Policy (§7,
    `https://bhakthibookshelf.in/privacy-policy#your-rights`) explains it and gives the
    support email for anyone who can't sign in.
  - **Partial retention (declare it):** orders, invoices and subscription records are
    kept after deletion because GST law requires it; the customer row is anonymised
    (name/email/password cleared, phone replaced). Devices, downloads, wishlist, reset
    OTPs and the matching newsletter entry are deleted.

## Data types collected

| Category | Type | Collected? | Shared? | Purpose | Optional? |
| --- | --- | --- | --- | --- | --- |
| Personal info | Name | Yes | No | Account management, App functionality (orders/invoices) | Required to sign up |
| Personal info | Email address | Yes | No¹ | Account management (password reset), App functionality (invoices), Developer communications (newsletter, only if the user subscribes) | Required to sign up |
| Personal info | Phone number | Yes | No | Account management (the login identifier) | Required to sign up |
| Personal info | Address | Yes (only website checkout asks for it; Play purchases don't) | No | App functionality (invoicing — `orders.address/city/pincode`) | Optional (only for buyers) |
| Personal info | Other info (GST number) | Yes, if the buyer gives one | No | App functionality (invoicing) | Optional |
| Financial info | Purchase history | Yes (incl. Google Play order ID + purchase token) | No | App functionality (library access, order history, GST invoices, refunds), Fraud prevention, security, and compliance (verifying each purchase with Google) | Optional (only for buyers) |
| Financial info | Payment info (card / UPI / bank) | **No** — entered in Google Play's payment sheet, handled by Google; never reaches the app or our server | No | — | — |
| Personal info | User IDs | Yes — our account number, sent to Google Play as the purchase's obfuscated account ID (account number + an HMAC, no name/phone/email) | No² | App functionality (link the purchase to the right library), Fraud prevention | Only when buying in the app |
| App activity | Other actions (wishlist) | Yes, when signed in | No | App functionality | Optional |
| Device or other IDs | Device ID | Yes, app only | No | App functionality (device-bound offline downloads, `customer_devices`) | Only if the user downloads a book |
| App activity | Search history, installed apps, other user-generated content | **No** | — | — | — |
| App info and performance | Crash logs, diagnostics | **No, while SENTRY_DSN is unset** (see below) | — | — | — |
| App activity | App interactions | **No, while GA_MEASUREMENT_ID is unset** (see below) | — | — | — |
| Location | Approximate / precise | **No** | — | — | — |
| Web browsing history | | **No** | — | — | — |
| Photos/videos/audio/files/docs | | **No** — the app never reads the device's media or files | — | — | — |
| Messages | | **No** — the contact form reaches us, not other users | — | — | — |
| Health, fitness, contacts, calendar | | **No** | — | — | — |

² Google Play receives it as our payment processor, which Play's form treats as a service
provider, not "sharing". If you prefer to be conservative, mark **User IDs: Shared** with
purpose "Fraud prevention, security, and compliance".

¹ Emails (order confirmations, invoices, OTPs, newsletter) go out through the SMTP
provider in `SMTP_HOST` on prod — **Gmail SMTP (`smtp.gmail.com`)**, checked 2026-11-24. Play generally
treats a mail relay you configure as your own infrastructure rather than "sharing", but
this is a judgment call; to be conservative, answer **Email address: Shared** with
purpose "App functionality" and name the provider (Google).

## Third parties data reaches

- **Google Play (Play Billing)** — runs the payment. Gets from the app the product ID and
  the obfuscated account ID (above); our server calls the Google Play Developer API to
  verify and acknowledge each purchase, and Google sends real-time notifications (pending
  UPI payments that complete later, refunds) to `/api/webhooks/google-play`.
- **Razorpay** — **website only.** The Play app never opens Razorpay (cart/checkout hidden
  and redirected), so there's no Razorpay "Payment info" share to declare for this app.
- **SMTP provider** — receives what's in outgoing emails. See footnote ¹.
- **No ad networks.** Analytics and crash reporting are built in but switched off — next
  section.

## Analytics and crash reporting (built in, currently OFF — checked on prod 2026-11-24)

Both are wired up but load nothing until their key is set on the server:

- **Google Analytics 4** (`GA_MEASUREMENT_ID`) — on the public site and the Android app,
  not the admin panel. Once ON, add to this form: **App activity → App interactions**,
  collected **and shared with Google**, purpose **Analytics**; also **Device or other
  IDs** (GA's cookie/instance ID) for Analytics.
- **Sentry** (`SENTRY_DSN`) — browser errors are posted to `/api/client-errors` and
  forwarded to Sentry with the page URL and user agent. Once ON, add: **App info and
  performance → Crash logs** and **Diagnostics**, collected **and shared with Sentry**,
  purpose **App functionality** (fixing bugs).

Update the form in Play Console first, then add the key — not the other way round.

## Before submitting — check

1. The prod contact email in Admin → Settings is `support@bhakthibookshelf.in`
   (migration 034 sets it if it was still the old Gmail address) — Play compares it
   with the listing and the privacy policy.
2. Device IDs are only visible to the customer who owns them (`GET
   /api/customer/devices` is behind the customer's own session). True today; this form
   relies on it.
3. Anything new that collects data (a new SDK, analytics, crash reporting, ads) means
   updating this form **before** it goes live.
