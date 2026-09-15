# Play Console — Data Safety form

Answers for Play Console → **App content → Data safety**, worked out from what the code
actually does (not a guess) — `app/lib/repositories/customerRepository.ts`,
`database/migrations/009_customers.sql` and `013_orders_customer_link.sql`,
`app/lib/services/downloadService.ts`, `app/lib/razorpayClient.ts`,
`app/lib/services/emailService.ts`. Re-check this if the data model changes before you
submit — Play can suspend an app for a form that doesn't match reality.

## First, the two form-level questions

- **Does your app collect or share any of the required user data types?** → **Yes.**
- **Is all of the user data collected encrypted in transit?** → **Yes**, assuming prod
  only ever serves over HTTPS (it does — `bhakthibookshelf.in`; the app refuses
  cleartext except in the debug/LAN-testing build, which never ships).
- **Do you provide a way for users to request that their data be deleted?** → **Yes** —
  `https://bhakthibookshelf.in/privacy-policy#your-rights` (contact-based; there's no
  in-app self-service delete button yet — see the gap noted at the bottom).

## Data types collected

| Category | Type | Collected? | Shared? | Purpose | Optional? |
| --- | --- | --- | --- | --- | --- |
| Personal info | Name | Yes | No | Account functionality, App functionality (order/invoice) | Required to sign up |
| Personal info | Email address | Yes | No¹ | Account functionality, Account management (password reset), App functionality (invoices) | Required to sign up |
| Personal info | Phone number | Yes | No | Account functionality (this is the login identifier) | Required to sign up |
| Personal info | Address | Yes | No | App functionality (order fulfillment / invoicing — `orders.address/city/pincode`) | Required to check out |
| Personal info | Other (GST number) | Yes, if the buyer supplies one | No | App functionality (invoicing) | Optional |
| Financial info | Purchase history | Yes | No | App functionality (account order/subscription history), Analytics — *no, not used for analytics* | Required (inherent to buying) |
| Financial info | Payment info (card / UPI / bank) | **No — never reaches your server** | **Shared with Razorpay** | Payment processing | N/A — required to pay |
| Device or other IDs | Device ID | Yes, app only | No | App functionality (device-bound offline downloads, §"customer_devices" table) | Required only if the user chooses to download a book for offline reading |
| App activity | Everything else in this category (in-app search history, installed apps, other user-generated content, other actions) | **No** | — | — | — |
| App info and performance | Crash logs, diagnostics, other performance data | **No** — no crash reporting / analytics SDK is integrated | — | — | — |
| Location | Approximate / precise | **No** | — | — | — |
| Web browsing history | | **No** | — | — | — |
| Photos/videos/audio/files/docs | | **No** — the app never reads the device's media or file store | — | — | — |
| Messages | | **No** — the contact form sends a message *to you*, not between users; Play's "Messages" category is for user-to-user messaging, which this app doesn't have | — | — | — |
| Health, fitness, contacts, calendar | | **No** | — | — | — |

¹ Order/invoice emails are sent through your SMTP provider (Gmail, per
`SMTP_HOST=smtp.gmail.com`) purely as a transport — Play generally treats a mail relay
you configure as your own infrastructure rather than "sharing to a third party" the way
it treats a payment gateway or ad SDK, but this is a judgment call. If you'd rather be
conservative, answer **email address: Shared** with purpose "App functionality" and name
Gmail/Google Workspace as the processor.

## Third parties data reaches

- **Razorpay** — receives payment/card/UPI details directly from the checkout widget
  (`checkout.razorpay.com/v1/checkout.js`) and the order amount/reference; your server
  never sees card data, only Razorpay's payment/order/signature IDs
  (`app/lib/razorpayClient.ts`, `app/api/orders/verify-payment`). Declare this as the
  "Financial info" share.
- **SMTP provider (Gmail)** — receives whatever you put in outgoing emails: order
  confirmations, invoices, OTPs (`app/lib/services/emailService.ts`). See footnote ¹.
- **No ad networks, no analytics SDKs, no crash reporters** — there is nothing else to
  declare. This keeps the form short; don't let a Play Console default template add
  categories (e.g. "Analytics") that don't apply here.

## Gaps to close before this form is fully honest

1. **No self-service account/data deletion in the app.** The privacy policy (now linked
   at `/privacy-policy#your-rights`) describes a contact-based process, which Play
   accepts as the "Data deletion" URL, but it's worth knowing this is the weaker of the
   two options Play offers — an in-app delete button is the alternative if you want it
   later.
2. **Device ID description above assumes it stays server-side, not shown to other
   users** — true today (`GET /api/customer/devices` is behind the customer's own
   session). No change needed, just noting the assumption this form relies on.
3. If you ever add analytics, crash reporting, or an ad SDK, this form (and the summary
   in `docs/play-store-listing.md`) needs updating **before** the next release — Play
   checks the SDKs actually bundled in the APK against what the form declares.
