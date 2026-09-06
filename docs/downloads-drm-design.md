# Offline Downloads & Book Protection — Technical Design

**Status:** Draft for review · **Date:** 2026-09-07 · **Applies to:** Android app, web, (iOS later)

Letting readers keep purchased books on one device, readable without a network,
without handing out a file anyone can forward.

---

The Bhakthi Bookshelf app today is a shell around the live website — everything the
reader sees is `bhakthibookshelf.in` loaded over the network. This document describes
what it takes to add a real offline library on top of that: books that download onto
*one* device, stay encrypted at rest, open only inside the app, and can't be copied
out or carried to another device — even by the same account.

## 1. What you asked for

- A **Downloads** area listing every book the reader has downloaded.
- Downloaded books readable **fully offline**.
- Files **encrypted on the device**, not plain PDFs in storage.
- **Device-bound** — signing in with the same account on another phone does *not* bring
  the downloads across.
- **No sharing** of a downloaded book or its file, by any route.
- Books open only in an **in-app reader**.
- Each page carries a **watermark**, and **screenshots are blocked**.

## 2. Three limits to design around

None of these are Capacitor problems — they're platform facts.

### 2a. iPhone cannot block screenshots *(hard limit, iOS)*

iOS gives an app no way to stop a still screenshot. It can only be *told one was taken*
(after the fact), blur content when the app backgrounds, and defeat screen *recording*
with a known secure-field trick. On Android a full block is available. So on iPhone the
**watermark is the real deterrent** — the same position Kindle and Google Play Books take.

### 2b. "Offline" means the app can no longer be pure server-mode *(architecture)*

Right now, with no signal, the app shows nothing — it can't even load the site. An
offline library needs its own screen and reader **bundled into the app**, running from
local files. The rest of the app stays online exactly as it is; only the Downloads +
Reader section becomes local. See §4.

### 2c. The iOS half can't be built yet *(infrastructure)*

Building and signing an iOS app needs macOS. The Android feature ships first; the iOS
port waits until there's a Mac or a macOS CI pipeline. Plan for Android now, iOS as a
distinct later phase.

## 3. What already exists (reuse)

- `AccessService.customerHasAccessToBook(customerId, bookId)` — true if the customer
  bought the book *or* has an active subscription.
- `GET /api/customer/download/[bookId]` — already checks the session and entitlement,
  then streams `books.full_pdf`. Today it returns a plain PDF; the app needs an
  encrypted, licensed variant alongside it.
- Customer JWT session (`getCustomerSession()`) and the protected `/account` area.

The new work is the **protection and offline** layer — not entitlements, payments, or
"who owns what".

## 4. How it works

Every download is tied to a triple — **account + book + device** — recorded on the
server. The book is encrypted with a key unique to that download; the key lives in the
phone's hardware-backed keystore, the encrypted file in app-private storage. Neither is
readable by other apps, a file manager, or a device backup.

### Download & license flow

```
Reader app  ──1. request (account + book + device)──▶  Server /api/customer/downloads
                                                         │
                                                         ├─▶ AccessService (purchase / subscription)
                                                         │
Reader app  ◀──2. encrypted book + key (in headers)─────┘
   │
   ├─▶ encrypted book  ──▶  app-private store
   └─▶ key + iv + tag  ──▶  hardware keystore
```

The key never touches disk as a plain file — it comes back in response headers and goes
straight into the keystore. **There is no re-validation or expiry:** once a book is on a
device it stays, and keeps working offline forever, even if the subscription that
unlocked it later lapses. The server still records every download so a re-install can
restore for free, and so "Manage devices" has something to list.

### Device identity

On first launch the app generates a random ID and stores it in the keystore. It
survives app updates, is wiped on uninstall, and is never derived from hardware
identifiers the app stores prohibit. The server registers it as a named device
("Pixel 8 · added 7 Sep").

### The reader

Books render page-by-page to a canvas via a bundled PDF engine (PDF.js) — the file is
decrypted in memory, a page at a time. No system PDF viewer, no "open in", no print, no
text-selection layer. Each rendered page has the reader's **email and phone drawn into
it** on a faint diagonal, as part of the image, so it can't be removed from the DOM.

### Screenshots & recording

| Platform | While the reader is open |
| --- | --- |
| **Android** | `FLAG_SECURE` — screenshots and screen recording both fail, the app is blank in the recents switcher and blocked from casting. |
| **iOS** | Screenshot is *detected* and logged; screen *recording* and mirroring show blank via a secure-field layer; content is covered when the app backgrounds. A still screenshot itself can't be stopped — the watermark carries the deterrent. |

### Losing entitlement

Downloaded books are **permanent**. A lapsed subscription, a deauthorized device, or a
refund does **not** reach back and remove copies already on a device. Deauthorizing a
device only stops it taking *new* downloads and frees a slot. (An admin can still mark a
specific download revoked after a refund dispute — the app drops it on next sync — but
nothing is automatic.)

### Signing out

Logging out does **not** wipe the local library. The encrypted files stay on the device,
tied to the account that downloaded them, and reappear when that same account signs back
in. Another account signing in on the same device sees only its own downloads.

### What the offline shell changes

```
TODAY
  App ──network, everything──▶ bhakthibookshelf.in        (no network = blank app)

WITH THE OFFLINE LIBRARY
  App shell ──most routes, online──▶ bhakthibookshelf.in
  App shell ──Downloads + Reader──▶ bundled local module ──▶ encrypted store (works offline)
```

Only the Downloads + Reader path is new. Store, browsing, checkout and account screens
keep loading from the live site exactly as today.

## 5. Data model

Two new tables, both referencing existing `customers` and `books`. Migration
`020_offline_downloads.sql`.

| Table | Columns | Purpose |
| --- | --- | --- |
| `customer_devices` | `id, customer_id, device_id, platform, label, first_seen, last_seen, revoked_at` | Every device an account has activated. Deauthorizing sets `revoked_at`; that device's books die at next validation. |
| `book_downloads` | `id, customer_id, book_id, device_id, licensed_at, last_validated_at, expires_at, revoked_at` | One row per book per device. Drives the Downloads list, the validation schedule, and the caps. |

## 6. New endpoints

All under the existing customer-session middleware.

| Route | Does |
| --- | --- |
| `POST /api/customer/devices` | Register this device / touch `last_seen`. Enforces the per-account device cap. |
| `GET /api/customer/devices` | List activated devices for the "Manage devices" screen. |
| `DELETE /api/customer/devices/:id` | Deauthorize a device. Frees a slot; its downloads stop at next validation. |
| `POST /api/customer/downloads` | Request a book for this device. Checks `AccessService`, records the license, returns the encrypted book + wrapped key. |
| `GET /api/customer/downloads` | What this device is licensed for — used to reconcile after re-login. |
| `POST /api/customer/downloads/:id/validate` | The periodic re-check. Returns keep / revoke. |
| `DELETE /api/customer/downloads/:id` | Reader removes a download to free space or a device slot. |

## 7. Native pieces

- `@capacitor/filesystem` — encrypted book files in app-private, backup-excluded storage.
- A secure-storage plugin (Keychain / Android Keystore) — wrapped keys and the device ID.
- `@capacitor/device` — platform and model for the device label.
- A small **custom plugin** for screen protection: toggle Android `FLAG_SECURE`; on iOS,
  screenshot notification + secure-field overlay + background cover.
- A bundled PDF rendering engine (PDF.js) and the local Downloads/Reader module — shipped
  inside the app, not loaded from the site.

Adding these plugins means every release is a **new store build** — unlike web changes,
which reach the app the moment they deploy.

## 8. Delivery, in three phases

Each phase is shippable on its own.

1. **Android + web — the core.** Tables, endpoints, device identity, encrypted download,
   local encrypted store, in-app PDF reader with watermark, Android `FLAG_SECURE`. The
   Downloads screen and reader run from the bundled module so they work offline. Ships as
   an Android APK / AAB.
2. **Hardening.** "Manage devices" screen, local library reconcile on login (restore
   after re-install, drop admin-revoked downloads), storage management, graceful handling
   of a book updated or unpublished after download.
3. **iOS.** Once a Mac or macOS CI exists: add the iOS platform, port the native plugin
   (screenshot detection, secure-field recording block, background cover), test the reader
   in WKWebView, submit through TestFlight.

## 9. Decisions needed from you

Business rules, not engineering ones. **Decided 2026-09-07:**

| Question | Decision |
| --- | --- |
| Who can download a book — buyers only, or subscribers too? | **Both** — a subscriber can download while their plan is active. |
| When a subscription lapses, do downloaded books keep working? | **Yes — kept.** Downloads are permanent; nothing is wiped. |
| Check-in / expiry window? | **None.** No re-validation — dropped from scope. |
| How many devices per account? | **3.** Deauthorizing one frees a slot. |
| Watermark — what shows, how loud? | **Email + phone, faint, diagonal, once per page.** |
| Cap on downloads per book / per account? | **No cap** beyond the device limit. |

## 10. What this stops — and what it doesn't

- **Stops:** forwarding the file, copying a book to another phone, casual
  screen-recording, and — on Android — screenshots outright.
- **Deters:** photographing the screen, and iOS screenshots, because every page names the
  person who could have leaked it.
- **Doesn't stop:** a determined person with a rooted/jailbroken device and time. No
  client-side scheme does. The goal is to make casual copying pointless — which covers
  almost all real leakage, and is the bar Kindle and Play Books settle for.
