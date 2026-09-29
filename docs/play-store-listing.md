# Play Console — Store Listing

Content to paste into Play Console → **Grow → Store presence → Main store listing**.
Contact details below match Admin → Settings on prod (`support@bhakthibookshelf.in` —
migration 034 switched it from the old Gmail address on 2026-09-29 — and
`+91 78921 19482`). **Confirm them in `/admin/settings`** before you submit; Play
cross-checks the listing against the app's own privacy policy page.

Last reviewed **2026-09-29 (late)**: **the Android app is read-only** (owner decision,
option A — Admin → Settings → "Android app: allow buying" is OFF; verified on prod by the
smoke test). The app sells nothing and has **no link or text pointing to the website for
buying** (Play/Apple anti-steering), so this listing must not either: no prices, no "buy",
no "subscribe on our website". Customers buy on the website on their own; the app reads
what their account already owns. The reader no longer watermarks pages, and customers can
delete their own account.

---

## App details

| Field | Value |
| --- | --- |
| App name (30 char max) | `Bhakthi Bookshelf` (17 chars) |
| Package name | `com.bhakthibookshelf.app` |
| Default language | English (India) — add Kannada (kn-IN) as an additional listing language once you have Kannada copy; the app itself already serves Kannada content via `LanguageSwitcher`. |
| Category | **Books & Reference** |
| Tags (pick up to 5 in Console) | Religion & Spirituality, Reading, Ebooks |
| Contact email | `support@bhakthibookshelf.in` |
| Contact phone | `+91 78921 19482` |
| Website | `https://bhakthibookshelf.in` |
| Privacy policy URL | `https://bhakthibookshelf.in/privacy-policy` |
| Delete account URL (Data safety) | `https://bhakthibookshelf.in/account/delete-account` |

## Short description (80 characters max)

Pick one (both fit):

> Devotional e-books & sacred texts. Read online or download for offline.
*(74 chars)*

> Your devotional library in English & Kannada — read online or offline.
*(71 chars)*

Don't name specific titles (Bhagavad Gita, Ramayana…) until they're actually in the
catalogue — Play treats listing content the app doesn't have as misleading.

## Full description (4000 characters max)

```
Bhakthi Bookshelf is a home for devotional reading — sacred texts, scriptures,
and spiritual books, with your Bhakthi Bookshelf library in your pocket.

WHAT YOU CAN DO
• Browse a growing library of devotional and religious e-books in English and
  Kannada
• Sign in with your Bhakthi Bookshelf account and read the books in your
  library in the in-app reader
• Save books for offline reading — once downloaded, they stay readable even
  without an internet connection
• See upcoming Hindu festivals, each with a shloka, in the Festival Calendar

BUILT FOR DEVOTED READERS
Every book download is protected: encrypted on your device and tied to your
account and that device, so your books stay yours.
You can register up to 3 devices and manage them at any time from
Account → Manage Devices.

Whether you're starting your day with a prayer, preparing for a festival, or
exploring something new, Bhakthi Bookshelf keeps your library with you —
online or off.

Your account, your choice: you can delete your account at any time from
My Account.

Questions or support: support@bhakthibookshelf.in
```

*(~900 characters — well under the 4000 limit; expand with real catalogue highlights
once you decide what to feature.)*

## What's new (release notes, this release)

```
• New app icon.
• Delete your account any time from My Account.
• Manage your devices from Account → Manage Devices; downloads restore
  automatically if you reinstall the app.
```

---

## Graphic assets — in `docs/play-store-assets/`

Remade **2026-09-29** with the new logo, from the live site in Android-app mode
(screenshots retaken the same evening in read-only mode).

| Asset | Spec | File | Notes |
| --- | --- | --- | --- |
| App icon | 512×512 PNG | `app-icon-512.png` | Copy of `public/icons/icon-512.png` — the icon in APK 1.2, so the listing matches the installed app. |
| Feature graphic | 1024×500 PNG (no alpha) | `feature-graphic.png` | Navy/gold, the new logo in a rounded-square gold frame (a circle crops "A Home for Devotional Reading"), wordmark + tagline. HTML source was a one-off; rebuild the same way if the logo changes. |
| Phone screenshots | 1000×1950 PNG (≤2:1) | `screenshot-1-home.png`, `screenshot-2-book-detail.png` (Lord Ganesha), `screenshot-3-festivals.png` (Festival Calendar), `screenshot-4-library.png` (category chips incl. Other) | Retaken **2026-09-29 (late)** in read-only mode (buying OFF): Downloads tab instead of Cart, no prices or buy buttons — the old Subscribe shot was dropped because the app no longer has that page. Live site at 500 CSS px ×2 with `window.Capacitor` faked as Android, so they show the app's bottom tab bar. The announcement bar was hidden for the capture (announcements change). Retake when the catalogue grows so the Library shows more than one book. |
| 7" / 10" tablet screenshots | Same rules, optional | — | Not made; only if you expect tablet installs. |
| Promo video | Optional, YouTube URL | — | Skip for v1. |

**Note on the screenshot method**: headless Chrome's `--window-size` below ~500px
CSS width isn't honored reliably in this environment (clamps to 500 and produces
garbled stale-layout renders) — don't reuse a sub-500 width if regenerating these.
500 CSS width + `--force-device-scale-factor=2` (1000px physical output) works
cleanly and was verified against a real production build, not just dev.

---

## Content rating questionnaire (Play Console → App content → Content rating)

Answering as a devotional reading app:

- Violence, sexual content, profanity, controlled substances: **None**.
- User-generated content / social features: **None** (no comments, chat, or public
  profiles — the contact form only reaches you, not other users).
- Shares user location: **No**.
- Digital purchases: **No** — nothing is sold in the app (read-only; see the Play
  Billing note below).
- Gambling / simulated gambling: **No**.

This should land the app at the lowest rating tier in every region (e.g. **PEGI 3 /
Everyone**). Answer live in Console — the questionnaire changes slightly by region — but
nothing here should push it higher.

## App access (Play Console → App content → App access)

Reading a book needs a login and a book the account already owns, so provide a **test
account** so Play's reviewers can sign in:

- Use a seeded, non-production customer (not a real customer's data) that **already owns
  at least one book** (there's no admin "grant" button — do one real ₹20 test
  purchase on the website with that account) — otherwise the reviewer only sees "This book isn't in your library yet."
- Include phone + password, and a note that OTP-based password reset needs a real inbox
  if the reviewer might hit that flow — reviewers generally won't unless asked to.

## Target audience & content (Play Console → App content)

- Target age group: **18 and over**, or **13 and over** if you don't want the stricter
  "designed for families" requirements — this app isn't aimed at children, so 18+ is
  the simpler, safer choice.
- Ads: **No ads** (confirm — nothing in the codebase serves ads).

---

## Before you can actually submit

1. **Play Billing** — **Decision 2026-09-29 (late): option A, read-only app.** Admin →
   Settings → "Android app: allow buying" is **OFF**, so the Android app hides every
   Buy/Subscribe/Cart/Checkout entry point, redirects `/cart`, `/checkout`, `/subscribe`,
   `/order-success` to `/downloads` (`app/components/native/AppModeGuard.tsx`), and
   (`12e8021`) has **no link out to the website** anywhere. Owned books and the lifetime
   subscription still work through `AccessService`. The app sells nothing, so Play Billing
   doesn't apply. The prod smoke test checks all of this ("android app is read-only",
   "no link out to the website").
   - **Keep it that way:** never switch buying ON for Android while the app is in the
     store, and never flip it OFF just for review and back ON afterwards — Google treats
     that as evasion and can ban the developer account.
   - Don't add "buy on our website" text or links to the app, the listing, screenshots or
     release notes (anti-steering).
   - Options costed if the owner wants in-app buying later: **Play Billing** (~2–4 weeks;
     a Play product per book + one for the lifetime plan, server-side token verification,
     Google takes 15%) or **User Choice Billing, India** (Play Billing *plus* Razorpay side
     by side, ~11% to Google on Razorpay sales). Both need a Capacitor Play Billing plugin
     (none installed today).
2. **Data Safety form** — see `docs/play-store-data-safety.md`, drafted from what the
   code actually collects and sends.
3. **Data deletion URL** — Play Console → App content → Data safety → "Delete account
   URL": `https://bhakthibookshelf.in/account/delete-account` (sign in → delete form).
   The in-app route is My Account → Delete my account.
4. A **Play Console developer account** (one-time $25 fee) if you don't already have one.
