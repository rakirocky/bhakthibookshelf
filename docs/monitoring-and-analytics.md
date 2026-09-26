# Error monitoring (Sentry) and visitor analytics (Google Analytics 4)

Both are **off until a key is added** to `.env.local` on the server. With no
key, nothing is loaded or sent and the privacy policy doesn't mention them.
Both keys are read when the server starts — after adding or changing one,
restart the app (`pm2 restart bhakthi-app --update-env`); no rebuild needed.

## 1. Sentry — get told when something breaks

1. Sign up (free "Developer" plan) at https://sentry.io with the business
   Google account.
2. Create a project → platform **Next.js** → name it `bhakthi-bookshelf`.
   Skip the setup wizard — the code is already in place.
3. Copy the project's **DSN** (Settings → Projects → bhakthi-bookshelf →
   Client Keys). It looks like
   `https://abc123@o456.ingest.sentry.io/789`.
4. On the server, add to `/data/bhakthi-app/.env.local`:

   ```
   SENTRY_DSN=https://abc123@o456.ingest.sentry.io/789
   SENTRY_ENVIRONMENT=production
   ```

5. Restart the app. Sentry emails the account owner on every *new* kind of
   error (Alerts → default "issue alert").

What gets reported: server crashes (pages, APIs, payments), browser
crashes on the website, and crashes inside the Android app — each tagged
`side: browser` / `platform: web | android-app`. No names, phone numbers,
emails, IP addresses or payment details are sent. Performance tracing is
off, so the free plan's quota is used by errors only.

Checking the setup: `SENTRY_DEBUG=1` in `.env.local` logs what the SDK does
to the pm2 log (remove it afterwards).

## 2. Google Analytics 4 — see who visits and what they do

1. Go to https://analytics.google.com with the business Google account →
   Admin → Create → Property "Bhakthi Bookshelf", time zone India, currency
   INR.
2. Add a **Web** data stream for `https://bhakthibookshelf.in`. Keep
   "Enhanced measurement" on (it counts page changes, scrolls, outbound
   clicks and the Library's `?q=` searches).
3. Copy the **Measurement ID** (`G-XXXXXXXXXX`).
4. On the server, add to `/data/bhakthi-app/.env.local`:

   ```
   GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

5. Restart the app. Visits show up under Reports → Realtime within a
   minute.

Events the site sends (GA4's standard names, so the built-in e-commerce
reports work): `add_to_cart`, `add_to_wishlist`, `purchase` (with order
number and amount, once per order), `sign_up`, `login`, `share`
(WhatsApp / copy link, book or shloka). A user property `platform`
(`web` / `android-app`) separates app and website visitors. The admin panel
is never tracked.

**Play Store:** once GA is on, the app's Data safety form must declare
"App activity → App interactions / Analytics" collected, not shared, not
linked to identity.

## Privacy policy

`/privacy-policy` automatically shows a "3a. Analytics and Error
Monitoring" section (and mentions Google Analytics / Sentry under Cookies
and Data sharing) only for the services whose key is set.
