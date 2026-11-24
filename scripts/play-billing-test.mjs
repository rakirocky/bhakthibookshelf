// End-to-end test of the Google Play purchase path against a FAKE Google
// (token endpoint, Play Developer API, Pub/Sub OIDC keys) — the real Play
// can only be exercised from a Play-installed app with a license tester.
//
// Starts its own `next dev` on PORT (default 3998) wired to the fake, so it
// never touches prod or Google. LOCAL DATABASE ONLY: creates two throwaway
// customers (phones 90000xxxxx, emails @example.invalid) and deletes them
// with their orders/subscriptions at the end.
//
//   node --env-file=.env.local scripts/play-billing-test.mjs

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { generateKeyPairSync, randomBytes, createSign } from "node:crypto";
import pg from "pg";

const PORT = Number(process.env.PORT || 3998);
const FAKE_PORT = 4999;
const BASE = `http://127.0.0.1:${PORT}`;
const FAKE = `http://127.0.0.1:${FAKE_PORT}`;
const PKG = "com.bhakthibookshelf.app";
const AUD = `${BASE}/api/webhooks/google-play`;

if (!/^(localhost|127\.0\.0\.1)$/.test(process.env.DB_HOST || "")) {
  console.error("Refusing to run: DB_HOST is not local.");
  process.exit(2);
}

let pass = 0, fail = 0;
const check = (name, ok, info = "") => {
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || !info ? "" : `  — ${info}`}`);
};

/* ---------- fake Google ---------- */

const sa = generateKeyPairSync("rsa", { modulusLength: 2048 });
const oidc = generateKeyPairSync("rsa", { modulusLength: 2048 });
const oidcJwk = { ...oidc.publicKey.export({ format: "jwk" }), kid: "test", alg: "RS256", use: "sig" };

const purchases = new Map(); // token -> ProductPurchase (+ productId)
const acks = new Map(); // token -> count
let tokenCalls = 0;

const fake = createServer(async (req, res) => {
  let body = "";
  for await (const c of req) body += c;
  const send = (code, obj) => {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(obj));
  };
  if (req.url === "/token" && req.method === "POST") {
    tokenCalls++;
    return send(200, { access_token: "fake-access", expires_in: 3600 });
  }
  if (req.url === "/certs") return send(200, { keys: [oidcJwk] });
  if (req.headers.authorization !== "Bearer fake-access") return send(401, { error: "auth" });
  const m = /^\/androidpublisher\/v3\/applications\/([^/]+)\/purchases\/products\/([^/]+)\/tokens\/([^/:]+)(:acknowledge)?$/.exec(req.url);
  if (!m || decodeURIComponent(m[1]) !== PKG) return send(404, { error: "nf" });
  const [, , pid, tok, ack] = m.map((x) => x && decodeURIComponent(x));
  const p = purchases.get(tok);
  if (!p || p.productId !== pid) return send(400, { error: { message: "Invalid Value" } });
  if (ack) {
    acks.set(tok, (acks.get(tok) || 0) + 1);
    p.acknowledgementState = 1;
    return send(200, {});
  }
  return send(200, p);
});
await new Promise((r) => fake.listen(FAKE_PORT, "127.0.0.1", r));

/* ---------- app under test ---------- */

const env = {
  ...process.env,
  PORT: String(PORT),
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: JSON.stringify({
    client_email: "test@fake.iam.gserviceaccount.com",
    private_key: sa.privateKey.export({ type: "pkcs8", format: "pem" }),
  }),
  GOOGLE_PLAY_API_BASE: `${FAKE}/androidpublisher/v3`,
  GOOGLE_OAUTH_TOKEN_URL: `${FAKE}/token`,
  GOOGLE_OIDC_JWKS_URL: `${FAKE}/certs`,
  GOOGLE_PLAY_RTDN_AUDIENCE: AUD,
  GOOGLE_PLAY_RTDN_EMAIL: "pubsub@fake.iam.gserviceaccount.com",
  SMTP_HOST: "127.0.0.1", // emails fail fast instead of going out
  SMTP_PORT: "1",
};
const next = spawn("npx", ["next", "dev", "-p", String(PORT)], { env, stdio: ["ignore", "pipe", "pipe"] });
let serverLog = "";
next.stdout.on("data", (d) => (serverLog += d));
next.stderr.on("data", (d) => (serverLog += d));

const db = new pg.Pool({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT), database: process.env.DB_NAME,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD,
});

const customers = [];

async function cleanup() {
  const ids = customers.map((c) => c.id).filter(Boolean);
  if (ids.length) {
    await db.query(`DELETE FROM store_purchases WHERE customer_id = ANY($1)`, [ids]);
    await db.query(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id = ANY($1))`, [ids]);
    await db.query(`DELETE FROM orders WHERE customer_id = ANY($1)`, [ids]);
    await db.query(`DELETE FROM subscriptions WHERE customer_id = ANY($1)`, [ids]);
    await db.query(`DELETE FROM customers WHERE id = ANY($1)`, [ids]).catch((e) => console.log("cleanup customers:", e.message));
  }
  await db.end();
  next.kill("SIGTERM");
  fake.close();
}

try {
  // wait for next dev
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(BASE + "/api/store/google/account")).status) break; } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }

  async function signup(tag) {
    const phone = "90000" + String(Math.floor(Math.random() * 1e5)).padStart(5, "0");
    const res = await fetch(BASE + "/api/customer/signup", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password: "TestPass#123", name: `Play Test ${tag}`, email: `play-${tag}-${phone}@example.invalid` }),
    });
    const cookie = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
    const { rows } = await db.query(`SELECT id FROM customers WHERE phone = $1`, [phone]);
    const c = { phone, cookie, id: rows[0]?.id };
    customers.push(c);
    return c;
  }
  const api = (c, path, body) =>
    fetch(BASE + path, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", ...(c ? { Cookie: c.cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    }).then(async (r) => ({ status: r.status, data: await r.json().catch(() => ({})) }));

  const A = await signup("a");
  const B = await signup("b");
  check("two test customers signed up", A.id && B.id && A.cookie && B.cookie);

  const { rows: [book] } = await db.query(`SELECT id, COALESCE(discount_price, price)::numeric AS price FROM books WHERE published ORDER BY id LIMIT 1`);
  const { rows: [plan] } = await db.query(`SELECT id, price FROM subscription_plans WHERE is_active ORDER BY id LIMIT 1`);

  // account token
  const anon = await api(null, "/api/store/google/account");
  check("account token needs sign-in", anon.status === 401, `got ${anon.status}`);
  const ta = (await api(A, "/api/store/google/account")).data.accountToken;
  const tb = (await api(B, "/api/store/google/account")).data.accountToken;
  check("account token issued", typeof ta === "string" && ta.startsWith(`${A.id}.`) && ta.length <= 64, ta);

  const newPurchase = (productId, account, extra = {}) => {
    const token = "tok_" + randomBytes(24).toString("hex");
    purchases.set(token, {
      productId, purchaseState: 0, acknowledgementState: 0,
      orderId: "GPA.TEST-" + randomBytes(4).toString("hex"),
      obfuscatedExternalAccountId: account, regionCode: "IN", purchaseType: 0, ...extra,
    });
    return token;
  };

  // 1. buy a book
  const bookPid = `book_${book.id}`;
  const t1 = newPurchase(bookPid, ta);
  const v1 = await api(A, "/api/store/google/verify", { productId: bookPid, purchaseToken: t1 });
  check("verify grants the book", v1.status === 200 && v1.data.status === "granted" && v1.data.already === false, JSON.stringify(v1));
  const { rows: o1 } = await db.query(
    `SELECT o.id, o.payment_status, o.payment_method, o.payment_id, o.invoice_no, o.total_amount, o.country, oi.book_id
     FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.customer_id = $1`, [A.id]);
  check("one PAID google_play order with invoice number", o1.length === 1 && o1[0].payment_status === "PAID" && o1[0].payment_method === "google_play" && o1[0].invoice_no > 0, JSON.stringify(o1));
  check("order price = book price, Google order id kept", o1[0] && Number(o1[0].total_amount) === Number(book.price) && o1[0].payment_id === purchases.get(t1).orderId && Number(o1[0].book_id) === Number(book.id));
  check("purchase acknowledged with Google", acks.get(t1) === 1, `acks ${acks.get(t1)}`);

  // 2. idempotent
  const v1b = await api(A, "/api/store/google/verify", { productId: bookPid, purchaseToken: t1, restore: true });
  const { rows: [{ n: n1 }] } = await db.query(`SELECT count(*)::int n FROM orders WHERE customer_id = $1`, [A.id]);
  check("repeat verify: already granted, no second order", v1b.data.already === true && n1 === 1, JSON.stringify(v1b));

  // 3. someone else's purchase
  const v3 = await api(B, "/api/store/google/verify", { productId: bookPid, purchaseToken: t1 });
  check("another account can't claim the purchase", v3.status === 403, `got ${v3.status}`);

  // 4. unknown token / wrong product / bad product id
  const v4 = await api(A, "/api/store/google/verify", { productId: bookPid, purchaseToken: "tok_forged" });
  check("forged token rejected", v4.status === 400, `got ${v4.status}`);
  const v4b = await api(A, "/api/store/google/verify", { productId: `book_999999`, purchaseToken: t1 });
  check("token for a different product rejected", v4b.status === 400, `got ${v4b.status}`);
  const v4c = await api(A, "/api/store/google/verify", { productId: "../../x", purchaseToken: t1 });
  check("malformed product id rejected", v4c.status === 400, `got ${v4c.status}`);

  // 5. forged account token
  const t5 = newPurchase(bookPid, `${B.id}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`);
  const v5 = await api(B, "/api/store/google/verify", { productId: bookPid, purchaseToken: t5 });
  check("purchase with forged account token rejected", v5.status === 400, `got ${v5.status}`);

  // 6. pending, then completed via notification
  const t6 = newPurchase(bookPid, tb, { purchaseState: 2 });
  const v6 = await api(B, "/api/store/google/verify", { productId: bookPid, purchaseToken: t6 });
  check("pending purchase not granted yet", v6.data.status === "pending", JSON.stringify(v6));

  const sign = (payload, key = oidc.privateKey) => {
    const h = Buffer.from(JSON.stringify({ alg: "RS256", kid: "test", typ: "JWT" })).toString("base64url");
    const now = Math.floor(Date.now() / 1000);
    const p = Buffer.from(JSON.stringify({ iss: "https://accounts.google.com", aud: AUD, iat: now, exp: now + 600,
      email: "pubsub@fake.iam.gserviceaccount.com", email_verified: true, ...payload })).toString("base64url");
    const s = createSign("RSA-SHA256").update(`${h}.${p}`).sign(key).toString("base64url");
    return `${h}.${p}.${s}`;
  };
  const rtdn = (notification, jwt = sign({})) =>
    fetch(AUD, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ message: { data: Buffer.from(JSON.stringify({ version: "1.0", packageName: PKG, eventTimeMillis: String(Date.now()), ...notification })).toString("base64"), messageId: "1" }, subscription: "x" }),
    });

  purchases.get(t6).purchaseState = 0;
  const r6 = await rtdn({ oneTimeProductNotification: { version: "1.0", notificationType: 1, purchaseToken: t6, sku: bookPid } });
  const { rows: o6 } = await db.query(`SELECT payment_status FROM orders WHERE customer_id = $1`, [B.id]);
  check("notification grants the completed pending purchase", r6.status === 200 && o6.length === 1 && o6[0].payment_status === "PAID", `${r6.status} ${JSON.stringify(o6)}`);

  // 7. notification auth
  const bad1 = await rtdn({ testNotification: { version: "1.0" } }, "not-a-jwt");
  const bad2 = await rtdn({ testNotification: { version: "1.0" } }, sign({}, sa.privateKey));
  const bad3 = await rtdn({ testNotification: { version: "1.0" } }, sign({ aud: "https://evil.example" }));
  const bad4 = await rtdn({ testNotification: { version: "1.0" } }, sign({ email: "someone@else.com" }));
  const ok7 = await rtdn({ testNotification: { version: "1.0" } });
  check("notification: bad / wrong-key / wrong-audience / wrong-sender tokens refused", [bad1, bad2, bad3, bad4].every((r) => r.status === 401), [bad1, bad2, bad3, bad4].map((r) => r.status).join(","));
  check("notification: genuine test notification accepted", ok7.status === 200, `got ${ok7.status}`);

  // 8. lifetime plan
  const planPid = `plan_${plan.id}`;
  const t8 = newPurchase(planPid, ta);
  const v8 = await api(A, "/api/store/google/verify", { productId: planPid, purchaseToken: t8 });
  const { rows: s8 } = await db.query(`SELECT payment_status, payment_method, ends_at, invoice_no FROM subscriptions WHERE customer_id = $1`, [A.id]);
  check("lifetime plan purchase activates subscription", v8.data.status === "granted" && s8.length === 1 && s8[0].payment_status === "PAID" && s8[0].payment_method === "google_play" && s8[0].ends_at === null && s8[0].invoice_no > 0, JSON.stringify({ v8, s8 }));

  // 9. concurrency: 6 parallel verifies of one new purchase
  const { rows: [book2] } = await db.query(`SELECT id FROM books WHERE published AND id <> $1 ORDER BY id LIMIT 1`, [book.id]);
  if (book2) {
    const pid2 = `book_${book2.id}`;
    const t9 = newPurchase(pid2, tb);
    const results = await Promise.all(Array.from({ length: 6 }, () => api(B, "/api/store/google/verify", { productId: pid2, purchaseToken: t9 })));
    const { rows: [{ n }] } = await db.query(`SELECT count(*)::int n FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.customer_id = $1 AND oi.book_id = $2`, [B.id, book2.id]);
    check("6 simultaneous verifies → exactly one order", n === 1 && results.every((r) => r.data.status === "granted") && results.filter((r) => r.data.already === false).length === 1, `orders ${n}; ${results.map((r) => r.status + ":" + r.data.already).join(",")}`);
  }

  // 10. library access + refund
  const lib1 = await fetch(`${BASE}/downloads`, { headers: { Cookie: A.cookie } });
  check("customer's pages load after purchase", lib1.status === 200, `got ${lib1.status}`);
  const r10 = await rtdn({ voidedPurchaseNotification: { purchaseToken: t1, orderId: purchases.get(t1).orderId, productType: 2, refundType: 1 } });
  const { rows: o10 } = await db.query(`SELECT o.payment_status FROM orders o JOIN store_purchases sp ON sp.order_id = o.id WHERE sp.purchase_token = $1`, [t1]);
  check("refund notification revokes the book order", r10.status === 200 && o10[0]?.payment_status === "REFUNDED", JSON.stringify(o10));
  const v10 = await api(A, "/api/store/google/verify", { productId: bookPid, purchaseToken: t1, restore: true });
  check("refunded purchase can't be re-granted by a restore", v10.status === 400, `got ${v10.status}`);
  const r10b = await rtdn({ voidedPurchaseNotification: { purchaseToken: t8, productType: 2, refundType: 1 } });
  const { rows: s10 } = await db.query(`SELECT payment_status FROM subscriptions WHERE customer_id = $1`, [A.id]);
  check("refund notification revokes the lifetime plan", r10b.status === 200 && s10[0]?.payment_status === "REFUNDED", JSON.stringify(s10));

  check("Google access token cached (one token exchange)", tokenCalls >= 1 && tokenCalls <= 3, `token calls ${tokenCalls}`);
} catch (error) {
  fail++;
  console.error("ERROR", error);
} finally {
  await cleanup();
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) {
  console.log("\n--- server log (tail) ---\n" + serverLog.split("\n").slice(-60).join("\n"));
}
process.exit(fail ? 1 : 0);
