# Play Console — Store Listing

Content to paste into Play Console → **Grow → Store presence → Main store listing**,
plus the App content answers that depend on what the app does.

Last reviewed **2026-11-24**: the Play Store app (**1.9, versionCode 11**) **sells books and
the lifetime plan through Google Play Billing** (deployed to prod `73f7fc8`). Inside that app:

- each book page has one **Buy** button priced from the website (₹29 today), product ID
  `book_<id>`; **Subscribe** sells **Lifetime Access ₹999**, product ID `plan_1`;
- the website's cart, checkout and Razorpay are **hidden** and `/cart`, `/checkout`,
  `/order-success` redirect away (`AppModeGuard`) — Google Play is the only way to pay;
- there's still **no link or text sending users to the website to pay** (anti-steering).

The website and older sideloaded APKs (≤1.8, no PlayBilling plugin) keep Razorpay — they
aren't distributed through Play, so that's allowed.

Contact details match Admin → Settings on prod (`support@bhakthibookshelf.in`,
`+91 78921 19482`). Play cross-checks them against the privacy policy page.

---

## What to upload (first release)

| Item | Value |
| --- | --- |
| File | `android/app/build/outputs/bundle/release/app-release.aab` (built 2026-11-16; rebuild recipe in memory `android-capacitor-build-env`) |
| Version | **1.9**, versionCode **11** — target SDK **36**, min SDK 24, Play Billing Library 8.3.0, `com.android.vending.BILLING` permission |
| Upload key | `~/keystores/bhakthibookshelf-release.jks`, alias `bhakthibookshelf`, cert SHA-256 `25:FE:74:34:84:D2:C4:40:CB:BC:9B:CC:AF:C1:60:5F:AC:AC:32:EC:08:6B:2B:B6:D6:0E:A6:DC:0A:60:0A:28` |
| First track | **Internal testing** — a real purchase only works for an app installed from a Play track |

**Play App Signing (asked on the first upload):** choose *"Use a different key → Export and
upload a key from Java keystore"* and upload **our** key. Then phones that installed the APK
from `bhakthibookshelf.in/downloads/` can update from Play without uninstalling. Play shows a
`pepk.jar` + an **encryption key** on that screen — send the encryption key; the export runs
on this laptop, where the keystore lives.

**Reviewer account (App content → App access):** see "App access" below.

---

## App details

| Field | Value |
| --- | --- |
| App name (30 char max) | `Bhakthi Bookshelf` |
| Package name | `com.bhakthibookshelf.app` |
| Play Store link (fixed by the package name; works once published) | `https://play.google.com/store/apps/details?id=com.bhakthibookshelf.app` |
| Default language | English (India) — Kannada (kn-IN) listing optional, later |
| App or game / Free or paid | App / **Free** (with in-app purchases) |
| Category | **Books & Reference** |
| Tags (up to 5) | Religion & Spirituality, Reading, Ebooks |
| Contact email | `support@bhakthibookshelf.in` |
| Contact phone | `+91 78921 19482` |
| Website | `https://bhakthibookshelf.in` |
| Privacy policy URL | `https://bhakthibookshelf.in/privacy-policy` |
| Terms (trader / ToS link) | `https://bhakthibookshelf.in/terms-conditions` |
| Delete account URL (Data safety) | `https://bhakthibookshelf.in/account/delete-account` |

## Short description (80 characters max)

> Devotional e-books in English & Kannada. Read online or download for offline.

*(77 characters)*

## Full description (4000 characters max)

```
Bhakthi Bookshelf is a home for devotional reading — epics, scriptures, prayers,
divine stories and the glory of sacred places, in English and Kannada.

WHAT YOU CAN DO
• Browse more than 180 devotional e-books in English and Kannada, by category:
  Epics, Scriptures, Prayers, Divine Stories, Glory of Places and more
• Filter the library by book language — All, English or Kannada
• Buy a book once and keep it in your library, or choose Lifetime Access to
  read every book
• Read in the built-in reader, made for comfortable reading on your phone
• Download books for offline reading — once saved, they open without internet
• See upcoming Hindu festivals, each with a shloka, in the Festival Calendar

SAFE AND SIMPLE
• Purchases are made securely through Google Play
• A GST tax invoice is created for every purchase
• Downloads are encrypted on your device and tied to your account, so your
  books stay yours. Use up to 3 devices and manage them any time from
  Account → Manage Devices
• Delete your account any time from My Account

Whether you're starting your day with a prayer, preparing for a festival, or
exploring something new, Bhakthi Bookshelf keeps your devotional library with
you — online or off.

Questions or support: support@bhakthibookshelf.in
```

*(About 1,200 characters.)*

## What's new (release notes, 1.9)

```
• Buy books and Lifetime Access securely with Google Play.
• More than 180 devotional books in English and Kannada.
• Library filter by book language: All, English, Kannada.
• Read offline, Festival Calendar with shlokas, manage devices and delete your
  account any time from My Account.
```

---

## In-app products (Monetize → Products → In-app products)

Needs the **India merchant account verified** (Payments profile without "Issue with
account") before Play lets you set prices.

| Product ID | Name | Price | Count |
| --- | --- | --- | --- |
| `book_<id>` (website book id, e.g. `book_12`) | the book's title | ₹29 (must equal the website price — the app shows the website price and the server checks Google's) | one per published book — **184** on 2026-11-24 (132 English + 52 Kannada) |
| `plan_1` | Lifetime Access | ₹999 | 1 |

All are **one-time, consumable = No** (managed products; the server acknowledges each
purchase). I'll create them in bulk (CSV import or the Play Developer API) once the merchant
account is ready. **A book added later on the website needs its `book_<id>` product too**,
otherwise its Buy button in the app shows "not available".

---

## Graphic assets — in `docs/play-store-assets/`

| Asset | Spec | File | Notes |
| --- | --- | --- | --- |
| App icon | 512×512 PNG | `app-icon-512.png` | Same as the installed app's icon (round logo since 1.7). |
| Feature graphic | 1024×500 PNG (no alpha) | `feature-graphic.png` | Source `feature-graphic.html` — render at e.g. 1024×700 and crop to 1024×500. |
| Phone screenshots | 1000×1950 PNG | `screenshot-1-home.png`, `screenshot-2-library.png` (language + category chips, 184 books), `screenshot-3-book-detail.png` (Sri Vishnu Dasha Avatar, **Buy — ₹29.00**), `screenshot-4-kannada-books.png` (ಕನ್ನಡ filter, 52 books), `screenshot-5-lifetime-access.png` (**Buy — ₹999.00**), `screenshot-6-festivals.png` | Retaken **2026-11-24** in Play Billing app mode (Capacitor + PlayBilling plugin faked, signed-in throwaway customer) against a local copy of the live catalogue (books/plans/settings/festival dates + covers only). Upload in this order. No Razorpay, cart or website link anywhere. |
| Tablet screenshots, promo video | optional | — | Skip for v1. |

**Screenshot method:** headless Chrome at 500 CSS px wide with
`--force-device-scale-factor=2` (below ~500 px the window size isn't honoured — see
memory `headless-chrome-screenshot-gotcha`).

---

## Content rating questionnaire (App content → Content rating)

- Violence, sexual content, profanity, controlled substances: **None**.
- User-generated content / users interact: **No** (the contact form only reaches us).
- Shares user location: **No**.
- **Digital purchases: Yes** — e-books and Lifetime Access via Google Play Billing.
- Gambling / simulated gambling: **No**.

Expected result: the lowest tier everywhere (e.g. PEGI 3 / Everyone).

## App access (App content → App access)

Select **"All or some functionality is restricted"** and add login instructions:

- A **test customer account** (phone + password) — not a real customer. Have it **own one
  book** (one ₹29 purchase on the website) so the reviewer can open the reader and download
  offline straight away.
- Note for the reviewer: *"Sign in with the phone number and password above. Books in My
  Library open in the reader; other books can be bought with Google Play."*
- Add the same Gmail as a **licence tester** (Setup → Licence testing) only for our own
  testing; reviewers buy with Google's own test setup.

## Target audience & ads (App content)

- Target age group: **18 and over** (not aimed at children; avoids the Families rules).
- Ads: **No ads**.

## Other App content items

- **Financial features:** none (selling digital content is not a financial feature).
- **Government app:** No. **News app:** No. **Health:** none.
- **Trader status (per app):** Trader — the same details as the developer account.

---

## Before you submit — checklist

1. India merchant account verified (Google test deposit entered).
2. In-app products created (184 books + `plan_1`), all **Active**.
3. Service account with Play Console access → JSON key on prod
   (`GOOGLE_PLAY_SERVICE_ACCOUNT_FILE`) so the server can verify purchases; Pub/Sub topic for
   real-time notifications → `GOOGLE_PLAY_RTDN_AUDIENCE` on prod.
4. Internal testing upload → one licence-tester purchase + one real ₹29 purchase on a phone
   (book appears in the library, invoice created, order shows in Play → Order management).
5. Data safety form from `docs/play-store-data-safety.md`.
6. Then Production → countries: **India** first (the cross-border/BillDesk merchant account
   only matters for buyers outside India).

**Never** show Razorpay, a "buy on our website" link, or website prices as an alternative
in the Play app, its listing, screenshots or release notes.
