#!/usr/bin/env node
// Full smoke test — run before every deploy (local) and after it (prod).
//
//   node scripts/smoke-test.mjs                                   # http://localhost:3010
//   SMOKE_BASE=https://bhakthibookshelf.in node scripts/smoke-test.mjs
//   ADMIN_PHONE=... ADMIN_PASSWORD=... node scripts/smoke-test.mjs  # also checks the admin portal (read-only)
//
// Drives a real headless Chrome through the REAL buttons (never hand-made
// data): pages, Add to Cart → cart → checkout, Buy, a deleted book in the
// cart, wishlist, Kannada, phone width, the Android/iOS app modes and the
// admin portal. Creates no orders, accounts or DB rows. Needs Node 22+
// (global WebSocket) and Google Chrome/Chromium. Exits 1 on any failure.
//
// Not covered (do by hand before the client tests): a real Razorpay payment,
// downloading/reading a book on a real phone, emails arriving.
import { spawn, execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = (process.env.SMOKE_BASE ?? "http://localhost:3010").replace(/\/$/, "");
const results = [];
const pass = (name, detail = "") => results.push({ ok: true, name, detail });
const fail = (name, detail = "") => results.push({ ok: false, name, detail });
const warn = (name, detail = "") => results.push({ ok: true, warn: true, name, detail });
const check = (name, cond, detail = "") => (cond ? pass(name, detail) : fail(name, detail));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- 1. HTTP: every public page and API ---------------- */
async function http(path, init = {}) {
  const res = await fetch(BASE + path, { redirect: "manual", ...init });
  const body = await res.text();
  return { status: res.status, location: res.headers.get("location") ?? "", body };
}

const index = JSON.parse((await http("/api/books/search-index?all=1")).body);
check("books exist (search index)", Array.isArray(index) && index.length > 0, `${index.length} published`);
const book = index[0] ?? {};

for (const p of [
  "/", "/books", `/books/${book.slug}`, "/about", "/about-us", "/contact", "/subscribe", "/cart",
  "/festivals", "/wishlist", "/downloads", "/privacy-policy", "/terms-conditions",
  "/account/login", "/account/signup", "/account/forgot-password", "/robots.txt", "/sitemap.xml",
]) {
  const r = await http(p);
  check(`GET ${p} → 200`, r.status === 200, `got ${r.status}`);
}
for (const [p, to] of [["/checkout", "/account/required"], ["/account", "/account/required"], ["/admin", "/admin/login"]]) {
  const r = await http(p);
  check(`GET ${p} (logged out) → sign-in`, [302, 303, 307, 308].includes(r.status) && r.location.includes(to), `${r.status} → ${r.location}`);
}
{
  const h = await http("/api/health");
  check("API /api/health", h.status === 200 && h.body.includes("ok"), h.body.slice(0, 60));
  const a = await http("/api/announcements");
  check("API /api/announcements", a.status === 200 && Array.isArray(JSON.parse(a.body).announcements));
  const av = await http("/api/books/availability", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: [String(book.id), 99999999] }),
  });
  const avj = JSON.parse(av.body);
  check("API availability: real book yes, missing book no",
    avj.books?.length === 1 && Number(avj.books[0].id) === Number(book.id), av.body.slice(0, 120));
  const del = await http("/api/customer/delete-account", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  check("API delete-account refuses without login", del.status === 401, `got ${del.status}`);
}

/* ---------------- 2. Real browser ---------------- */
const chrome = ["google-chrome", "chromium", "chromium-browser"]
  .map((c) => { try { return execSync(`which ${c}`, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; } })
  .find(Boolean);
if (!chrome) { fail("Chrome found", "install google-chrome"); finish(); }

const port = 9500 + Math.floor(Math.random() * 400);
const profile = mkdtempSync(join(tmpdir(), "smoke-"));
const proc = spawn(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
for (let i = 0; i < 50; i++) { try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch { await sleep(200); } }

async function openTab({ platform, width = 1280, height = 900, cookies = [] } = {}) {
  const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const waiting = new Map(); const errors = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (waiting.has(d.id)) { waiting.get(d.id)(d.result ?? { error: d.error }); waiting.delete(d.id); }
    if (d.method === "Runtime.exceptionThrown") errors.push(d.params.exceptionDetails.exception?.description?.split("\n")[0] ?? d.params.exceptionDetails.text);
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; waiting.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  for (const c of cookies) await send("Network.setCookie", { ...c, url: BASE });
  if (platform) await send("Page.addScriptToEvaluateOnNewDocument", { source: `window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>"${platform}"};` });
  const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.value;
  // Fixed wait for client code to settle, then keep waiting (up to 15 s) until
  // the new document has fully loaded — on a slow network 3.5 s wasn't always
  // enough and checks ran against a half-loaded page ("no header" flakes).
  const go = async (path, wait = 3500) => {
    errors.length = 0; await send("Page.navigate", { url: BASE + path }); await sleep(wait);
    for (let i = 0; i < 30 && (await ev("document.readyState")) !== "complete"; i++) await sleep(500);
  };
  const click = (re) => ev(`(()=>{const b=[...document.querySelectorAll('button,a')].find(b=>${re}.test(b.textContent.trim())&&b.offsetParent!==null);if(!b)return null;b.click();return b.textContent.trim()})()`);
  // Close the tab itself, not just the socket: tabs left open share the
  // site's localStorage and would interfere with the next check.
  const close = async () => { ws.close(); await fetch(`http://127.0.0.1:${port}/json/close/${tab.id}`).catch(() => {}); };
  return { send, ev, go, click, errors, close };
}

const pagesToScan = ["/", "/books", `/books/${book.slug}`, "/about", "/about-us", "/contact", "/cart", "/festivals", "/wishlist", "/account/login"];

// 2a. Desktop + phone: no JS errors, no broken images, no sideways scroll
for (const [label, width] of [["desktop", 1280], ["phone", 400]]) {
  const t = await openTab({ width });
  for (const p of pagesToScan) {
    await t.go(p);
    const s = await t.ev(`({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.src).map(i => i.src.split('/').pop()).slice(0,3),
      header: !!document.querySelector('header'),
      text: document.body.innerText.length })`);
    const problems = [
      t.errors.length && `JS error: ${t.errors[0]}`,
      s?.overflow && "page scrolls sideways",
      s?.broken?.length && `broken image ${s.broken.join(",")}`,
      !s?.header && "no header",
      s?.text < 60 && "almost empty page",
    ].filter(Boolean);
    check(`${label} ${p} renders cleanly`, problems.length === 0, problems.join("; "));
  }
  await t.close();
}

const isSignIn = (u) => u.startsWith("/account/login") || u.startsWith("/account/required");

// 2a2. Book page shows no empty details ("Publisher -")
{
  const t = await openTab();
  await t.go(`/books/${book.slug}`);
  const empty = await t.ev(`[...document.querySelectorAll('.book-meta p')].filter(p => /^-?$/.test(p.innerText.split('\\n').slice(1).join('').trim())).map(p => p.querySelector('strong')?.innerText)`);
  check("book page hides empty details", Array.isArray(empty) && empty.length === 0, `empty: ${empty}`);
  await t.close();
}

// 2b. Add to Cart → cart → checkout, with the real buttons
{
  const t = await openTab();
  await t.go(`/books/${book.slug}`);
  await t.ev("localStorage.clear()");
  await t.go(`/books/${book.slug}`);
  const clicked = await t.click("/^add to cart$/i");
  await sleep(800);
  const cart = JSON.parse((await t.ev("localStorage.getItem('cart')")) ?? "[]");
  check("Add To Cart button adds the book", clicked && cart.length === 1 && cart[0].slug === book.slug, `clicked=${clicked} cart=${cart.length}`);
  await t.go("/cart");
  const c = await t.ev(`({ alert: document.querySelector('[role=alert]')?.innerText ?? null,
    empty: document.body.innerText.includes('currently empty'),
    title: document.body.innerText.includes(${JSON.stringify(book.title)}) })`);
  check("cart keeps an available book (no 'no longer available')", !c.alert && !c.empty && c.title, JSON.stringify(c));
  await t.click("/proceed to checkout/i");
  await sleep(3500);
  const url = await t.ev("location.pathname + location.search");
  check("Proceed to Checkout → sign-in when logged out", isSignIn(url), url);
  check("cart survives the checkout redirect", JSON.parse((await t.ev("localStorage.getItem('cart')")) ?? "[]").length === 1);
  await t.close();
}

// 2c. Buy button (adds + goes to checkout)
{
  const t = await openTab();
  await t.go(`/books/${book.slug}`);
  await t.ev("localStorage.clear()");
  await t.go(`/books/${book.slug}`);
  const clicked = await t.click("/^download full book/i");
  await sleep(3500);
  const url = await t.ev("location.pathname");
  const cart = JSON.parse((await t.ev("localStorage.getItem('cart')")) ?? "[]");
  check("Buy button → checkout sign-in with the book in cart", clicked && isSignIn(url) && cart.length === 1, `clicked=${clicked} url=${url} cart=${cart.length}`);
  await t.close();
}

// 2d. A book deleted by the admin while in a cart: removed with a notice, the real one stays
{
  const t = await openTab();
  await t.go(`/books/${book.slug}`);
  await t.ev("localStorage.clear()");
  await t.go(`/books/${book.slug}`); // reload so the page forgets the old cart
  await t.click("/^add to cart$/i");
  await sleep(800);
  await t.ev(`(()=>{const c=JSON.parse(localStorage.getItem('cart'));c.push({id:"99999999",slug:"deleted-book",title:"Smoke Deleted Book",author:"",price:1,cover:null,quantity:1});localStorage.setItem('cart',JSON.stringify(c))})()`);
  await t.go("/cart");
  const alert = await t.ev("document.querySelector('[role=alert]')?.innerText ?? ''");
  const cart = JSON.parse((await t.ev("localStorage.getItem('cart')")) ?? "[]");
  check("deleted book removed from cart with notice, real book kept",
    alert.includes("Smoke Deleted Book") && cart.length === 1 && cart[0].slug === book.slug, `alert="${alert.slice(0, 60)}" cart=${cart.map((x) => x.slug)}`);
  await t.close();
}

// 2d2. Two tabs: adding in one tab updates the other (no stale overwrite)
{
  const a = await openTab();
  await a.go(`/books/${book.slug}`);
  await a.ev("localStorage.clear()");
  await a.go(`/books/${book.slug}`);
  const b = await openTab();
  await b.go(`/books/${book.slug}`);
  await b.click("/^add to cart$/i");
  await sleep(1000);
  const badge = await a.ev(`[...document.querySelectorAll('a[href="/cart"]')].map(e => e.innerText).join(" ")`);
  check("two tabs: a book added in one tab shows in the other", /\b1\b/.test(badge ?? ""), `other tab shows "${(badge ?? "").trim()}"`);
  await a.close(); await b.close();
}

// 2e. Wishlist heart
{
  const t = await openTab();
  await t.go(`/books/${book.slug}`);
  await t.ev("localStorage.clear()");
  await t.go(`/books/${book.slug}`);
  await t.ev("document.querySelector('.wishlist-btn')?.click()");
  await sleep(800);
  const w = JSON.parse((await t.ev("localStorage.getItem('wishlist')")) ?? "[]");
  check("wishlist heart saves the book", w.includes(book.slug), JSON.stringify(w));
  await t.close();
}

// 2e2. Footer categories = the Library's category chips, and each link opens its chip
{
  const t = await openTab();
  await t.go("/books");
  const chips = await t.ev(`[...document.querySelectorAll('.category-chips .category-chip')].slice(1).map(b => b.innerText.trim())`);
  await t.go("/"); // the footer is on the home page, not the Library
  const links = await t.ev(`[...document.querySelectorAll('footer a[href^="/books?category="]')].map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href') }))`);
  check("footer lists every Library category", chips?.length > 0 && JSON.stringify(chips) === JSON.stringify(links.map((l) => l.text)),
    `library=[${chips}] footer=[${links.map((l) => l.text)}]`);
  const wrong = [];
  for (const l of links) {
    await t.go(l.href, 2500);
    const on = await t.ev(`document.querySelector('.category-chip.is-on')?.innerText.trim()`);
    if (on !== l.text) wrong.push(`${l.text}→${on}`);
  }
  check("each footer category link opens that category", wrong.length === 0, wrong.join("; "));
  await t.close();
}

// 2e3. Contact email: footer and Contact page agree (Play cross-checks it with the listing)
{
  const t = await openTab();
  const mail = `[...document.querySelectorAll('a[href^="mailto:"]')].map(a => a.getAttribute('href').slice(7).toLowerCase())`;
  await t.go("/");
  const footerMail = await t.ev(`document.querySelector('footer a[href^="mailto:"]')?.getAttribute('href').slice(7).toLowerCase() ?? null`);
  await t.go("/contact");
  const contact = await t.ev(mail);
  check("footer email matches the Contact page", !!footerMail && contact.includes(footerMail), `footer=${footerMail} contact=[${contact}]`);
  await t.close();
}

// 2e4. Delete-account URL (given to Play) sends a logged-out visitor to sign in, then back
{
  const r = await fetch(`${BASE}/account/delete-account`, { redirect: "manual" });
  const to = new URL(r.headers.get("location") ?? "/", BASE);
  check("delete-account URL → sign in, then back to it", r.status >= 300 && r.status < 400 && isSignIn(to.pathname) && to.searchParams.get("from") === "/account/delete-account", `${r.status} ${to.pathname}${to.search}`);
}

// 2f. Kannada interface (only if the admin has it switched on)
{
  const t = await openTab({ cookies: [{ name: "site_language", value: "kannada" }] });
  await t.go("/");
  const lang = await t.ev("document.documentElement.lang");
  if (lang === "kn") {
    const txt = await t.ev("document.querySelector('header')?.innerText ?? ''");
    check("Kannada interface renders", /[ಀ-೿]/.test(txt) && t.errors.length === 0, t.errors[0] ?? "");
  } else pass("Kannada interface", "switched off in admin — skipped");
  await t.close();
}

// 2f2. Share buttons stay on the website (hidden only inside the apps)
{
  const t = await openTab({ width: 1280 });
  await t.go("/");
  const shloka = await t.ev(`!!document.querySelector('.daily-shloka__share')?.getClientRects().length`);
  await t.go(`/books/${book.slug}`);
  const share = await t.ev(`!!document.querySelector('.share-book')?.getClientRects().length`);
  check("website: WhatsApp/Copy-link share buttons visible", shloka && share, `shloka=${shloka} book=${share}`);
  await t.close();
}

// 2g. App modes: neither app links out to the website (Play + App Store
// anti-steering); Android read-only unless the admin switch is on, iOS always.
const WEBSITE_LINKS = `[...document.querySelectorAll('a[href]')].filter(a => { try { const u = new URL(a.href);
  return u.host !== location.host && /bhakthibookshelf\\.in$/.test(u.host) && a.getClientRects().length > 0; } catch { return false } }).map(a => a.href)`;
for (const platform of ["android", "ios"]) {
  const t = await openTab({ platform, width: 520 });
  await t.go("/");
  // open the bottom-nav More sheet too — it used to carry a website link
  await t.ev(`document.querySelector('button.bottom-nav__item[aria-haspopup]')?.click()`);
  await new Promise((r) => setTimeout(r, 500));
  const s = await t.ev(`({ native: document.documentElement.hasAttribute('data-native'),
    ios: document.documentElement.hasAttribute('data-ios'),
    moreOpen: !!document.querySelector('.more-sheet__footer'),
    links: ${WEBSITE_LINKS} })`);
  check(`${platform} app: native mode, no link out to the website`, s.native && s.moreOpen && s.links.length === 0 && (platform !== "ios" || s.ios), JSON.stringify(s));
  // share buttons put a website link in the message — website only
  const shloka = await t.ev(`!!document.querySelector('.daily-shloka__share')?.getClientRects().length`);
  await t.go(`/books/${book.slug}`);
  const share = await t.ev(`!!document.querySelector('.share-book')?.getClientRects().length`);
  check(`${platform} app: no WhatsApp/Copy-link share buttons`, !shloka && !share, `shloka=${shloka} book=${share}`);
  // Android follows Admin → Settings → "Android app: allow buying"; iOS is always read-only.
  const buyingOn = platform === "android" && (await t.ev("document.documentElement.hasAttribute('data-app-commerce')"));
  await t.go("/cart", 4500);
  const where = await t.ev("location.pathname");
  if (buyingOn) {
    check("android app: buying allowed (admin switch ON) — cart opens", where === "/cart", where);
    await t.go("/subscribe", 4000);
    const note = await t.ev(`[...document.querySelectorAll('a[target=_blank][href*="/subscribe"]')].some(a => a.offsetParent !== null)`);
    check("android app, buying ON: no 'visit our website' on Subscribe", note === false, `visible=${note}`);
    warn("Android 'allow buying' is ON", "client's choice (2026-09-29) — Play Store review may reject Razorpay for e-books unless Play Billing / user choice billing is set up");
  } else {
    check(`${platform} app is read-only (/cart → /downloads)`, where === "/downloads", where);
  }
  await t.close();
}

// 2h. Admin portal (read-only), when credentials are given
if (process.env.ADMIN_PHONE && process.env.ADMIN_PASSWORD) {
  const res = await fetch(BASE + "/api/admin/login", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: BASE },
    body: JSON.stringify({ phone: process.env.ADMIN_PHONE, password: process.env.ADMIN_PASSWORD }),
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const kv = setCookie.map((c) => c.split(";")[0]).find((c) => c.includes("admin"));
  check("admin login", res.ok && !!kv, `status ${res.status}`);
  if (kv) {
    const [name, value] = kv.split("=");
    const t = await openTab({ cookies: [{ name, value }] });
    for (const p of ["/admin", "/admin/books", "/admin/orders", "/admin/customers", "/admin/reports",
      "/admin/subscriptions", "/admin/announcements", "/admin/festivals", "/admin/settings", "/admin/promoters",
      "/admin/newsletter", "/admin/contact-messages", "/admin/books/add"]) {
      await t.go(p);
      const where = await t.ev("location.pathname");
      check(`admin ${p} opens`, where === p && t.errors.length === 0, where !== p ? `redirected to ${where}` : t.errors[0] ?? "");
    }
    await t.close();
  }
} else {
  pass("admin portal", "skipped — set ADMIN_PHONE/ADMIN_PASSWORD to include it");
}

proc.kill();
await new Promise((r) => { proc.once("exit", r); setTimeout(r, 3000); });
try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome still flushing — temp dir, harmless */ }
finish();

function finish() {
  const bad = results.filter((r) => !r.ok);
  for (const r of results) console.log(`${r.warn ? "WARN" : r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  — ${r.detail}` : ""}`);
  console.log(`\n${results.length - bad.length}/${results.length} passed against ${BASE}${bad.length ? `  —  ${bad.length} FAILED` : ""}`);
  process.exit(bad.length ? 1 : 0);
}
