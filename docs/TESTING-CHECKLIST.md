# Testing checklist

Run this before every deploy and before handing a build to the client for testing.

## 1. Automated smoke test (every deploy)

```bash
npm run build && npm start                 # local production build on :3010
npm run smoke                              # must pass before pushing
# after deploying:
SMOKE_BASE=https://bhakthibookshelf.in ADMIN_PHONE=… ADMIN_PASSWORD=… npm run smoke
```

`scripts/smoke-test.mjs` drives a real headless Chrome through the real buttons and checks:

- every public page loads (200) and signed-out pages redirect to sign-in
- no JavaScript errors, broken images or sideways scrolling, on desktop and phone width
- **Add to Cart → cart → Proceed to Checkout**, and the **Buy** button
- a deleted book in a cart is removed with a notice; available books stay
- two tabs stay in sync (cart)
- wishlist heart, Kannada interface
- Android app mode (website link shown; read-only unless "Android app: allow buying" is on) and iOS app mode
  (website link hidden, always read-only)
- every admin portal page opens (read-only; needs `ADMIN_PHONE` / `ADMIN_PASSWORD`)
- APIs: health, announcements, book availability, delete-account refuses without login

It creates no orders, accounts or database rows. `WARN` lines are not failures but need a decision
(e.g. "allow buying" must be OFF before the Play Store submission).

## 2. By hand (cannot be automated) — before the client tests

| Area | Steps | Expected |
|---|---|---|
| Payment | Sign in, buy a book with Razorpay (test mode or ₹1), including one failed attempt then success in the same window | Order success page, book in My Account, invoice email with GST |
| Subscription | Buy the lifetime plan | Every book opens in the library |
| Android app | Install the APK, sign in, download a book, turn on airplane mode, open it | Book opens offline; screenshots blocked |
| Account deletion | On a spare account with a downloaded book in the app: My Account → Delete my account | Logged out, downloads gone from the phone, can't log in |
| Emails | Signup, forgot password, order, contact form | Each email arrives (check spam) |
| Admin edits | Add/edit/delete a book, switch an announcement on/off, change a festival date | Shows on the site immediately (both workers) |
| Kannada | Switch to ಕನ್ನಡ, walk home → library → book → cart | All text Kannada, layout intact |

Record anything that fails, fix it, re-run section 1, then hand over.
