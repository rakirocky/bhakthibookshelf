# Play Console — Store Listing

Content to paste into Play Console → **Grow → Store presence → Main store listing**.
Contact details below use the fallback values in `app/privacy-policy/page.tsx` /
`SettingsService` (`BhakthiBookshelf@gmail.com`, `+91 90084 91459`) — **confirm these
match whatever's actually saved in `/admin/settings` on prod** before you submit; Play
cross-checks the listing against the app's own privacy policy page.

---

## App details

| Field | Value |
| --- | --- |
| App name (30 char max) | `Bhakthi Bookshelf` (17 chars) |
| Package name | `com.bhakthibookshelf.app` |
| Default language | English (India) — add Kannada (kn-IN) as an additional listing language once you have Kannada copy; the app itself already serves Kannada content via `LanguageSwitcher`. |
| Category | **Books & Reference** |
| Tags (pick up to 5 in Console) | Religion & Spirituality, Reading, Ebooks |
| Contact email | `BhakthiBookshelf@gmail.com` *(confirm live value)* |
| Contact phone | `+91 90084 91459` *(confirm live value)* |
| Website | `https://bhakthibookshelf.in` |
| Privacy policy URL | `https://bhakthibookshelf.in/privacy-policy` |

## Short description (80 characters max)

Pick one (both fit):

> Devotional e-books & sacred texts. Read online or download for offline.
*(74 chars)*

> Bhagavad Gita, Ramayana & more devotional reads — buy, subscribe, download.
*(78 chars)*

## Full description (4000 characters max)

```
Bhakthi Bookshelf is a home for devotional reading — sacred texts, scriptures,
and spiritual books you can buy individually or unlock with a subscription.

WHAT YOU CAN DO
• Browse a growing library of devotional and religious e-books in English and
  Kannada
• Buy a single book, or subscribe for access to the full library
• Read anywhere in the in-app reader
• Save books for offline reading — once downloaded, they stay readable even
  without an internet connection
• Track your orders and manage your subscription from your account

BUILT FOR DEVOTED READERS
Every book download is protected: encrypted on your device, watermarked with
your account details, and tied to that device, so your purchase stays yours.
You can register up to 3 devices and manage them at any time from
Account → Manage Devices.

Whether you're starting your day with the Bhagavad Gita, revisiting the
Ramayana, or exploring something new, Bhakthi Bookshelf keeps your library
with you — online or off.

Questions or support: BhakthiBookshelf@gmail.com
```

*(~950 characters — well under the 4000 limit; expand with real catalogue highlights
once you decide what to feature.)*

## What's new (release notes, this release)

```
• New: Manage your devices from Account → Manage Devices, and free up a slot
  any time.
• Downloads now restore automatically if you reinstall the app.
• Downloads screen shows how much space each book uses on your device.
```

---

## Graphic assets needed

None of these exist in the repo yet — they're image exports, not something I can
generate directly. Exact specs Play Console enforces:

| Asset | Spec | Notes |
| --- | --- | --- |
| App icon | 512×512 PNG, 32-bit with alpha | Play Console asset, separate from the APK's launcher icons in `android/app/src/main/res/mipmap-*`. Base it on the same `ic_launcher` art. |
| Feature graphic | 1024×500 JPG or PNG (no alpha) | Shown at the top of the listing. |
| Phone screenshots | 2–8 images, 16:9 or 9:16, min 320px, max 3840px on the long edge | Suggested set: home/catalogue, a book detail page, the in-app reader with a page open, Downloads screen, Manage Devices screen. |
| 7" / 10" tablet screenshots | Same rules, optional but recommended if you expect tablet installs | |
| Promo video | Optional, YouTube URL | Skip for v1. |

If you want, I can draft the feature graphic and a screenshot frame set as an HTML
mockup via the `design` skill and hand you PNG exports to drop in — say the word and I'll
start that once you've picked which screens to feature.

---

## Content rating questionnaire (Play Console → App content → Content rating)

Answering as a straightforward devotional reading + e-commerce app:

- Violence, sexual content, profanity, controlled substances: **None**.
- User-generated content / social features: **None** (no comments, chat, or public
  profiles — the contact form only reaches you, not other users).
- Shares user location: **No**.
- Digital purchases: **Yes** — books and subscriptions (see the Play Billing note below).
- Gambling / simulated gambling: **No**.

This should land the app at the lowest rating tier in every region (e.g. **PEGI 3 /
Everyone**). Answer live in Console — the questionnaire changes slightly by region — but
nothing here should push it higher.

## App access (Play Console → App content → App access)

Since most of the app requires a login to buy/read a book, provide a **test account**
so Play's reviewers can sign in:

- Use a seeded, non-production customer (not a real customer's data).
- Include phone + password, and a note that OTP-based password reset needs a real inbox
  if the reviewer might hit that flow — reviewers generally won't unless asked to.

## Target audience & content (Play Console → App content)

- Target age group: **18 and over**, or **13 and over** if you don't want the stricter
  "designed for families" requirements — this app isn't aimed at children and sells paid
  digital content, so 18+ is the simpler, safer choice.
- Ads: **No ads** (confirm — nothing in the codebase serves ads).

---

## Before you can actually submit

1. **Play Billing decision** (flagged separately) — Razorpay checkout currently runs
   inside the Android WebView for digital book/subscription purchases, which Play's
   payments policy generally requires to go through Google Play Billing instead. Resolve
   this before submitting; a listing built around this catalogue won't matter if the
   binary gets rejected on the payments policy.

   Two paths, with effort estimates (2026-09-16):

   **Path A — Migrate to Google Play Billing.** ~2–4 weeks dev + ongoing catalog
   maintenance.
   - Native bridge (3–5 days): no Play Billing plugin is installed today (checked
     `package.json` / `android/app/build.gradle`). Need a Capacitor plugin (community or
     custom) wrapping the Play Billing Library, exposed to the WebView's JS so the site
     can trigger native purchase UI on Android only.
   - Product catalog (1–3 days setup + **recurring**): every purchasable SKU must be
     pre-registered in Play Console. The subscription (single ₹999/yr plan) maps to one
     SKU — easy. Per-book purchases don't: each book needs its own managed product, so
     every new book added to the catalogue also needs a matching Play Console SKU created
     — an ongoing process cost, not one-time.
   - Server verification (3–5 days): new endpoint using the Google Play Developer API to
     verify purchase tokens server-side, mirroring `app/api/orders/verify-payment/route.ts`
     for Razorpay, plus acknowledging purchases (Play auto-refunds if not ack'd within 3
     days).
   - Entitlement wiring (2–3 days): mark the existing `orders`/`subscriptions` rows PAID
     from the Play path so `AccessService.customerHasAccessToBook()` keeps working
     unchanged — genuinely easy given the current architecture (it's already the single
     entitlement gate for both purchase types).
   - Renewal/refund events (2–3 days): Real-time Developer Notifications (Pub/Sub) as the
     webhook-equivalent backstop, same role as `app/api/webhooks/razorpay/route.ts`.
   - Testing (3–5 days elapsed): Play Billing sandbox only works against a build uploaded
     to at least an internal testing track — no local/sideload testing, so iteration is
     slow (upload → Play processing → test → repeat).
   - Business cost (ongoing): Google takes a 15–30% cut of Play-billed transactions, on
     top of whatever Razorpay already costs — and it's Android-app-only revenue, since the
     website keeps using Razorpay directly.

   **Path B — Keep Razorpay, remove in-app purchase entirely.** ~1–3 days.
   - Hide the Buy/Subscribe/Checkout entry points when running inside the Capacitor shell
     (`Capacitor.isNativePlatform()` check), so the app becomes read/library-only —
     already-owned books and active subscriptions still work via `AccessService` exactly
     as today, but new purchases can only happen on the website (mobile browser or
     desktop). Same pattern other read-only content apps use to legitimately sit outside
     Play's billing-policy scope, since the app never sells digital goods itself.
   - Work: feature-flag the checkout/subscribe UI on native, add a short "purchase on our
     website" message, regression-test that downloads/offline-reading for existing
     entitlements are untouched.
   - Tradeoff: lower in-app conversion (a user has to leave the app to buy), and some risk
     a reviewer still flags it if it looks like steering around billing rather than
     genuinely not selling in-app — lower risk than shipping Razorpay-in-webview as-is,
     but not zero.

   Path B is the pragmatic short-term unblock (days, not weeks) at the cost of in-app
   purchase friction. Path A is the "real" fix but is a multi-week project with a
   recurring product-catalog maintenance tax for every new book, plus Google's revenue
   cut. This is a business call for the owner.
2. **Data Safety form** — see `docs/play-store-data-safety.md`, drafted from what the
   code actually collects and sends.
3. **Data deletion URL** — Play Console → App content → Data safety → "Data deletion"
   now has a stable target: `https://bhakthibookshelf.in/privacy-policy#your-rights`.
4. A **Play Console developer account** (one-time $25 fee) if you don't already have one.
