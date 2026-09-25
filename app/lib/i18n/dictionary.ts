/**
 * Every customer-facing interface string, English and Kannada, in one
 * place so the Kannada can be reviewed/edited by the client in one file.
 * The UI is Kannada when the navbar language is ಕನ್ನಡ ("site_language"
 * cookie = Kannada); "All" and "EN" keep English.
 *
 * Placeholders like {n} are filled by t(key, { n: … }).
 * Kannada drafted 2026-09-25 — PENDING CLIENT REVIEW.
 */

export type UiLang = "en" | "kn";

const en = {
  // navigation
  "nav.home": "Home",
  "nav.library": "Library",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.subscribe": "Subscribe",
  "nav.downloads": "Downloads",
  "nav.myAccount": "My Account",
  "nav.account": "Account",
  "nav.cart": "Cart",
  "nav.more": "More",
  "brand.tagline": "A Home for Devotional Reading",

  // home — hero
  "hero.tag": "Trusted Digital Spiritual Library",
  "hero.title1": "Bhakthi",
  "hero.title2": "Bookshelf",
  "hero.description":
    "Discover timeless Hindu scriptures, devotional books, epics, prayers and spiritual wisdom. Build your own digital library and carry divine knowledge wherever you go.",
  "hero.explore": "Explore Library",
  "hero.browse": "Browse Collection",
  "hero.feature.curated": "Curated Collection",
  "hero.feature.instant": "Instant Downloads",
  "hero.feature.secure": "Secure Payments",

  // home — sections
  "featured.title": "Featured Books",
  "featured.subtitle": "Begin your spiritual journey with our carefully selected devotional books.",
  "featured.viewAll": "View All Books",
  "promise.title": "Our Promise",
  "promise.subtitle":
    "Every book we publish is chosen with devotion, authenticity and the desire to share timeless spiritual wisdom.",
  "promise.books": "Devotional books in our growing library.",
  "promise.readers": "Readers who've joined Bhakthi Bookshelf.",
  "promise.instant": "Instant",
  "promise.instantText": "Download your books immediately after purchase.",
  "promise.secure": "Secure",
  "promise.secureText": "Safe, encrypted payments on every order.",
  "why.title": "Why Choose Bhakthi Bookshelf?",
  "why.subtitle": "A trusted destination for spiritual seekers and devotees.",
  "why.authentic": "Authentic Scriptures",
  "why.authenticText": "Carefully curated devotional books from trusted sources.",
  "why.instant": "Instant Downloads",
  "why.instantText": "Purchase today and download immediately after payment.",
  "why.secure": "Secure Payments",
  "why.secureText": "Safe and reliable online payment experience.",
  "why.growth": "Spiritual Growth",
  "why.growthText": "Build your personal digital library of sacred knowledge.",
  "news.title": "Stay Connected",
  "news.text": "Subscribe to receive updates about new devotional books, festival collections and special offers.",
  "news.placeholder": "Enter your email address",
  "news.button": "Subscribe",
  "news.loading": "Subscribing...",
  "news.success": "You're subscribed — thank you!",
  "news.error": "Unable to subscribe.",

  // footer
  "footer.about":
    "Discover timeless Hindu scriptures, devotional books, epics, prayers and spiritual wisdom in one trusted digital library.",
  "footer.quickLinks": "Quick Links",
  "footer.books": "Books",
  "footer.categories": "Categories",
  "footer.scriptures": "Scriptures",
  "footer.epics": "Epics",
  "footer.prayers": "Prayers",
  "footer.devotional": "Devotional",
  "footer.support": "Support",
  "footer.contactUs": "Contact Us",
  "footer.privacy": "Privacy Policy",
  "footer.terms": "Terms & Conditions",
  "footer.appTitle": "Get the Bhakthi Bookshelf app",
  "footer.appText": "Read offline, download once, carry your library anywhere.",
  "footer.appButton": "Download for Android",
  "footer.rights": "© 2026 Bhakthi Bookshelf. All Rights Reserved.",

  // library
  "library.title": "Our Library",
  "library.subtitle": "Browse our devotional books collection.",
  "library.search": "Search books...",
  "library.sortFeatured": "Featured",
  "library.sortTitle": "Title A-Z",
  "library.sortPriceLow": "Price Low to High",
  "library.sortPriceHigh": "Price High to Low",
  "library.count": "{n} books found",
  "library.none": "No books found",
  "library.noneHint": "Try another search keyword.",

  // book card + book page
  "card.viewDetails": "View Details",
  "card.new": "New",
  "book.author": "Author",
  "book.publisher": "Publisher",
  "book.language": "Language",
  "book.pages": "Pages",
  "book.description": "Description",
  "book.related": "Related Books",
  "book.descriptionSoon": "Description will be updated soon.",
  "soon.title": "{lang} books are coming soon",
  "soon.browse": "Browse the library",
  "book.addToCart": "Add To Cart",
  "book.buyNow": "Download Full Book — ₹{price}",
  "book.notInLibrary": "This book isn't in your library yet.",
  "book.lookInside": "Look inside",
  "book.share": "Share",
  "book.copyLink": "Copy link",
  "book.linkCopied": "✓ Link copied",
  "crumb.home": "Home",
  "crumb.books": "Books",
  "lang.English": "English",
  "lang.Kannada": "Kannada",

  // offline + downloads
  "offline.save": "Save for offline reading",
  "offline.saving": "Saving…",
  "offline.read": "Read offline",
  "downloads.title": "Downloads",
  "downloads.subtitle": "Saved on this device · readable offline",
  "downloads.using": "Using {size} on this device",
  "downloads.syncing": "Syncing…",
  "downloads.loading": "Loading…",
  "downloads.empty": "No downloads yet. Open a book you own and tap",
  "downloads.read": "Read",
  "downloads.remove": "Remove",
  "downloads.removeAll": "Remove all downloads",
  "downloads.manageDevices": "Manage devices",
  "downloads.notSavedTitle": "Your books — not on this device yet",
  "downloads.notSavedHint": "Save a book to read it here, even offline.",
  "continue.label": "Continue reading",
  "continue.finished": "Finished — read again?",
  "continue.meta": "Page {page} of {total} · {pct}%",
  "continue.resume": "Resume ›",
  "continue.open": "Open",
} as const;

export type I18nKey = keyof typeof en;

const kn: Record<I18nKey, string> = {
  "nav.home": "ಮುಖಪುಟ",
  "nav.library": "ಗ್ರಂಥಾಲಯ",
  "nav.about": "ನಮ್ಮ ಬಗ್ಗೆ",
  "nav.contact": "ಸಂಪರ್ಕಿಸಿ",
  "nav.subscribe": "ಚಂದಾದಾರರಾಗಿ",
  "nav.downloads": "ಡೌನ್‌ಲೋಡ್‌ಗಳು",
  "nav.myAccount": "ನನ್ನ ಖಾತೆ",
  "nav.account": "ಖಾತೆ",
  "nav.cart": "ಕಾರ್ಟ್",
  "nav.more": "ಇನ್ನಷ್ಟು",
  "brand.tagline": "ಭಕ್ತಿ ಸಾಹಿತ್ಯದ ಮನೆ",

  "hero.tag": "ವಿಶ್ವಾಸಾರ್ಹ ಡಿಜಿಟಲ್ ಆಧ್ಯಾತ್ಮಿಕ ಗ್ರಂಥಾಲಯ",
  "hero.title1": "ಭಕ್ತಿ",
  "hero.title2": "ಬುಕ್‌ಶೆಲ್ಫ್",
  "hero.description":
    "ಕಾಲಾತೀತ ಹಿಂದೂ ಧರ್ಮಗ್ರಂಥಗಳು, ಭಕ್ತಿ ಪುಸ್ತಕಗಳು, ಮಹಾಕಾವ್ಯಗಳು, ಪ್ರಾರ್ಥನೆಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನವನ್ನು ಅನ್ವೇಷಿಸಿ. ನಿಮ್ಮದೇ ಡಿಜಿಟಲ್ ಗ್ರಂಥಾಲಯವನ್ನು ರೂಪಿಸಿ, ದೈವಿಕ ಜ್ಞಾನವನ್ನು ಎಲ್ಲೆಡೆ ನಿಮ್ಮೊಂದಿಗೆ ಕೊಂಡೊಯ್ಯಿರಿ.",
  "hero.explore": "ಗ್ರಂಥಾಲಯ ನೋಡಿ",
  "hero.browse": "ಸಂಗ್ರಹ ವೀಕ್ಷಿಸಿ",
  "hero.feature.curated": "ಆಯ್ದ ಸಂಗ್ರಹ",
  "hero.feature.instant": "ತಕ್ಷಣ ಡೌನ್‌ಲೋಡ್",
  "hero.feature.secure": "ಸುರಕ್ಷಿತ ಪಾವತಿ",

  "featured.title": "ವಿಶೇಷ ಪುಸ್ತಕಗಳು",
  "featured.subtitle": "ನಾವು ಆಯ್ದ ಭಕ್ತಿ ಪುಸ್ತಕಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಆಧ್ಯಾತ್ಮಿಕ ಪಯಣವನ್ನು ಆರಂಭಿಸಿ.",
  "featured.viewAll": "ಎಲ್ಲ ಪುಸ್ತಕಗಳನ್ನು ನೋಡಿ",
  "promise.title": "ನಮ್ಮ ಭರವಸೆ",
  "promise.subtitle":
    "ನಾವು ಪ್ರಕಟಿಸುವ ಪ್ರತಿಯೊಂದು ಪುಸ್ತಕವನ್ನೂ ಭಕ್ತಿ, ಪ್ರಾಮಾಣಿಕತೆ ಹಾಗೂ ಕಾಲಾತೀತ ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನವನ್ನು ಹಂಚುವ ಆಶಯದಿಂದ ಆಯ್ಕೆ ಮಾಡುತ್ತೇವೆ.",
  "promise.books": "ಬೆಳೆಯುತ್ತಿರುವ ನಮ್ಮ ಗ್ರಂಥಾಲಯದ ಭಕ್ತಿ ಪುಸ್ತಕಗಳು.",
  "promise.readers": "ಭಕ್ತಿ ಬುಕ್‌ಶೆಲ್ಫ್‌ಗೆ ಸೇರಿರುವ ಓದುಗರು.",
  "promise.instant": "ತಕ್ಷಣ",
  "promise.instantText": "ಖರೀದಿಸಿದ ತಕ್ಷಣವೇ ನಿಮ್ಮ ಪುಸ್ತಕಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
  "promise.secure": "ಸುರಕ್ಷಿತ",
  "promise.secureText": "ಪ್ರತಿ ಆರ್ಡರ್‌ಗೂ ಸುರಕ್ಷಿತ, ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಿದ ಪಾವತಿ.",
  "why.title": "ಭಕ್ತಿ ಬುಕ್‌ಶೆಲ್ಫ್ ಏಕೆ?",
  "why.subtitle": "ಆಧ್ಯಾತ್ಮಿಕ ಅನ್ವೇಷಕರು ಮತ್ತು ಭಕ್ತರಿಗೆ ವಿಶ್ವಾಸಾರ್ಹ ತಾಣ.",
  "why.authentic": "ಅಧಿಕೃತ ಧರ್ಮಗ್ರಂಥಗಳು",
  "why.authenticText": "ವಿಶ್ವಾಸಾರ್ಹ ಮೂಲಗಳಿಂದ ಎಚ್ಚರಿಕೆಯಿಂದ ಆಯ್ದ ಭಕ್ತಿ ಪುಸ್ತಕಗಳು.",
  "why.instant": "ತಕ್ಷಣ ಡೌನ್‌ಲೋಡ್",
  "why.instantText": "ಇಂದೇ ಖರೀದಿಸಿ, ಪಾವತಿಯಾದ ತಕ್ಷಣ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
  "why.secure": "ಸುರಕ್ಷಿತ ಪಾವತಿ",
  "why.secureText": "ಸುರಕ್ಷಿತ ಹಾಗೂ ವಿಶ್ವಾಸಾರ್ಹ ಆನ್‌ಲೈನ್ ಪಾವತಿ ಅನುಭವ.",
  "why.growth": "ಆಧ್ಯಾತ್ಮಿಕ ಬೆಳವಣಿಗೆ",
  "why.growthText": "ಪವಿತ್ರ ಜ್ಞಾನದ ನಿಮ್ಮದೇ ಡಿಜಿಟಲ್ ಗ್ರಂಥಾಲಯವನ್ನು ರೂಪಿಸಿ.",
  "news.title": "ಸಂಪರ್ಕದಲ್ಲಿರಿ",
  "news.text": "ಹೊಸ ಭಕ್ತಿ ಪುಸ್ತಕಗಳು, ಹಬ್ಬದ ಸಂಗ್ರಹಗಳು ಮತ್ತು ವಿಶೇಷ ಕೊಡುಗೆಗಳ ಮಾಹಿತಿ ಪಡೆಯಲು ಚಂದಾದಾರರಾಗಿ.",
  "news.placeholder": "ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ",
  "news.button": "ಚಂದಾದಾರರಾಗಿ",
  "news.loading": "ಚಂದಾದಾರಿಕೆ ಆಗುತ್ತಿದೆ...",
  "news.success": "ನೀವು ಚಂದಾದಾರರಾಗಿದ್ದೀರಿ — ಧನ್ಯವಾದಗಳು!",
  "news.error": "ಚಂದಾದಾರರಾಗಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",

  "footer.about":
    "ಕಾಲಾತೀತ ಹಿಂದೂ ಧರ್ಮಗ್ರಂಥಗಳು, ಭಕ್ತಿ ಪುಸ್ತಕಗಳು, ಮಹಾಕಾವ್ಯಗಳು, ಪ್ರಾರ್ಥನೆಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನ — ಒಂದೇ ವಿಶ್ವಾಸಾರ್ಹ ಡಿಜಿಟಲ್ ಗ್ರಂಥಾಲಯದಲ್ಲಿ.",
  "footer.quickLinks": "ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು",
  "footer.books": "ಪುಸ್ತಕಗಳು",
  "footer.categories": "ವರ್ಗಗಳು",
  "footer.scriptures": "ಧರ್ಮಗ್ರಂಥಗಳು",
  "footer.epics": "ಮಹಾಕಾವ್ಯಗಳು",
  "footer.prayers": "ಪ್ರಾರ್ಥನೆಗಳು",
  "footer.devotional": "ಭಕ್ತಿ ಸಾಹಿತ್ಯ",
  "footer.support": "ಸಹಾಯ",
  "footer.contactUs": "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",
  "footer.privacy": "ಗೌಪ್ಯತಾ ನೀತಿ",
  "footer.terms": "ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು",
  "footer.appTitle": "ಭಕ್ತಿ ಬುಕ್‌ಶೆಲ್ಫ್ ಆ್ಯಪ್ ಪಡೆಯಿರಿ",
  "footer.appText": "ಒಮ್ಮೆ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ, ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಓದಿ — ನಿಮ್ಮ ಗ್ರಂಥಾಲಯ ಎಲ್ಲೆಡೆ ನಿಮ್ಮೊಂದಿಗೆ.",
  "footer.appButton": "Android ಗಾಗಿ ಡೌನ್‌ಲೋಡ್",
  "footer.rights": "© 2026 ಭಕ್ತಿ ಬುಕ್‌ಶೆಲ್ಫ್. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",

  "library.title": "ನಮ್ಮ ಗ್ರಂಥಾಲಯ",
  "library.subtitle": "ನಮ್ಮ ಭಕ್ತಿ ಪುಸ್ತಕಗಳ ಸಂಗ್ರಹವನ್ನು ನೋಡಿ.",
  "library.search": "ಪುಸ್ತಕಗಳನ್ನು ಹುಡುಕಿ...",
  "library.sortFeatured": "ವಿಶೇಷ",
  "library.sortTitle": "ಶೀರ್ಷಿಕೆ (A-Z)",
  "library.sortPriceLow": "ಬೆಲೆ: ಕಡಿಮೆಯಿಂದ ಹೆಚ್ಚು",
  "library.sortPriceHigh": "ಬೆಲೆ: ಹೆಚ್ಚಿನಿಂದ ಕಡಿಮೆ",
  "library.count": "{n} ಪುಸ್ತಕಗಳು ಸಿಕ್ಕಿವೆ",
  "library.none": "ಯಾವುದೇ ಪುಸ್ತಕ ಸಿಗಲಿಲ್ಲ",
  "library.noneHint": "ಬೇರೆ ಪದದಿಂದ ಹುಡುಕಿ ನೋಡಿ.",

  "card.viewDetails": "ವಿವರಗಳನ್ನು ನೋಡಿ",
  "card.new": "ಹೊಸದು",
  "book.author": "ಲೇಖಕರು",
  "book.publisher": "ಪ್ರಕಾಶಕರು",
  "book.language": "ಭಾಷೆ",
  "book.pages": "ಪುಟಗಳು",
  "book.description": "ವಿವರಣೆ",
  "book.related": "ಸಂಬಂಧಿತ ಪುಸ್ತಕಗಳು",
  "book.descriptionSoon": "ವಿವರಣೆಯನ್ನು ಶೀಘ್ರದಲ್ಲೇ ಸೇರಿಸಲಾಗುವುದು.",
  "soon.title": "{lang} ಪುಸ್ತಕಗಳು ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿವೆ",
  "soon.browse": "ಗ್ರಂಥಾಲಯ ನೋಡಿ",
  "book.addToCart": "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
  "book.buyNow": "ಪೂರ್ಣ ಪುಸ್ತಕ ಡೌನ್‌ಲೋಡ್ — ₹{price}",
  "book.notInLibrary": "ಈ ಪುಸ್ತಕ ಇನ್ನೂ ನಿಮ್ಮ ಗ್ರಂಥಾಲಯದಲ್ಲಿಲ್ಲ.",
  "book.lookInside": "ಒಳಗೆ ನೋಡಿ",
  "book.share": "ಹಂಚಿಕೊಳ್ಳಿ",
  "book.copyLink": "ಲಿಂಕ್ ನಕಲಿಸಿ",
  "book.linkCopied": "✓ ಲಿಂಕ್ ನಕಲಾಗಿದೆ",
  "crumb.home": "ಮುಖಪುಟ",
  "crumb.books": "ಪುಸ್ತಕಗಳು",
  "lang.English": "ಇಂಗ್ಲಿಷ್",
  "lang.Kannada": "ಕನ್ನಡ",

  "offline.save": "ಆಫ್‌ಲೈನ್ ಓದಲು ಉಳಿಸಿ",
  "offline.saving": "ಉಳಿಸಲಾಗುತ್ತಿದೆ…",
  "offline.read": "ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಓದಿ",
  "downloads.title": "ಡೌನ್‌ಲೋಡ್‌ಗಳು",
  "downloads.subtitle": "ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ · ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಓದಬಹುದು",
  "downloads.using": "ಈ ಸಾಧನದಲ್ಲಿ {size} ಬಳಕೆಯಾಗಿದೆ",
  "downloads.syncing": "ಸಿಂಕ್ ಆಗುತ್ತಿದೆ…",
  "downloads.loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
  "downloads.empty": "ಇನ್ನೂ ಯಾವುದೇ ಡೌನ್‌ಲೋಡ್ ಇಲ್ಲ. ನಿಮ್ಮ ಪುಸ್ತಕವನ್ನು ತೆರೆದು ಒತ್ತಿ",
  "downloads.read": "ಓದಿ",
  "downloads.remove": "ತೆಗೆದುಹಾಕಿ",
  "downloads.removeAll": "ಎಲ್ಲ ಡೌನ್‌ಲೋಡ್‌ಗಳನ್ನು ತೆಗೆದುಹಾಕಿ",
  "downloads.manageDevices": "ಸಾಧನಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
  "downloads.notSavedTitle": "ನಿಮ್ಮ ಪುಸ್ತಕಗಳು — ಇನ್ನೂ ಈ ಸಾಧನದಲ್ಲಿಲ್ಲ",
  "downloads.notSavedHint": "ಇಲ್ಲಿ, ಆಫ್‌ಲೈನ್‌ನಲ್ಲೂ ಓದಲು ಪುಸ್ತಕವನ್ನು ಉಳಿಸಿ.",
  "continue.label": "ಓದು ಮುಂದುವರಿಸಿ",
  "continue.finished": "ಓದಿ ಮುಗಿದಿದೆ — ಮತ್ತೆ ಓದುವಿರಾ?",
  "continue.meta": "ಪುಟ {page} / {total} · {pct}%",
  "continue.resume": "ಮುಂದುವರಿಸಿ ›",
  "continue.open": "ತೆರೆಯಿರಿ",
};

const DICTS: Record<UiLang, Record<I18nKey, string>> = { en, kn };

export function translate(
  lang: UiLang,
  key: I18nKey,
  vars?: Record<string, string | number>
): string {
  let s = DICTS[lang][key] ?? en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

/** The interface language for a site_language cookie value. */
export function uiLangFor(siteLanguage: string | null | undefined): UiLang {
  return siteLanguage?.toLowerCase() === "kannada" ? "kn" : "en";
}
