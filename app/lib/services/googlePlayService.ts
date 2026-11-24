import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { readFileSync } from "fs";
import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT } from "jose";

/**
 * Google Play Developer API — just the calls in-app purchases need:
 * read a one-time purchase, acknowledge it, and verify Google's real-time
 * notifications. Auth is a Play Console service account (JSON key):
 *   GOOGLE_PLAY_SERVICE_ACCOUNT_FILE=/path/to/key.json   (or
 *   GOOGLE_PLAY_SERVICE_ACCOUNT_JSON='{...}')
 *   GOOGLE_PLAY_PACKAGE=com.bhakthibookshelf.app           (default)
 */

export const PLAY_PACKAGE =
  process.env.GOOGLE_PLAY_PACKAGE || "com.bhakthibookshelf.app";

// Overridable only so the purchase flow can be tested against a local
// fake Google (scripts/play-billing-test.mjs); never set these in prod.
const API =
  process.env.GOOGLE_PLAY_API_BASE ||
  "https://androidpublisher.googleapis.com/androidpublisher/v3";
const TOKEN_URL =
  process.env.GOOGLE_OAUTH_TOKEN_URL || "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/androidpublisher";

/* ---------- product ids ---------- */

// Play product ids: lowercase letters, digits, '_' and '.'. Keyed on the
// database id so renaming a book or its slug never breaks a product.
export function bookProductId(bookId: number) {
  return `book_${bookId}`;
}

export function planProductId(planId: number) {
  return `plan_${planId}`;
}

export function parseProductId(
  productId: string
): { kind: "book" | "plan"; id: number } | null {
  const m = /^(book|plan)_(\d+)$/.exec(productId);
  if (!m) return null;
  return { kind: m[1] as "book" | "plan", id: Number(m[2]) };
}

/* ---------- account token ---------- */

// Passed to Play as obfuscatedAccountId when the purchase starts, and
// returned by Google on every read of that purchase. It names our
// customer without PII and can't be forged (HMAC), so the server knows
// whose library a purchase belongs to — including in a notification that
// arrives with no logged-in session at all. Max 64 chars (Play limit).
function accountSecret() {
  const s =
    process.env.STORE_ACCOUNT_SECRET || process.env.CUSTOMER_SESSION_SECRET;
  if (!s) throw new Error("STORE_ACCOUNT_SECRET is not configured");
  return s;
}

function accountMac(customerId: number) {
  return createHmac("sha256", accountSecret())
    .update(`store-account:${customerId}`)
    .digest("base64url")
    .slice(0, 32);
}

export function accountTokenFor(customerId: number) {
  return `${customerId}.${accountMac(customerId)}`;
}

export function customerIdFromAccountToken(
  token: string | null | undefined
): number | null {
  if (!token) return null;
  const [idPart, mac] = token.split(".");
  const id = Number(idPart);
  if (!Number.isInteger(id) || id <= 0 || !mac) return null;
  const expected = Buffer.from(accountMac(id));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }
  return id;
}

/* ---------- service-account auth ---------- */

type ServiceAccount = { client_email: string; private_key: string };

let cachedKey: ServiceAccount | null = null;
let cachedToken: { value: string; expiresAt: number } | null = null;

export function isGooglePlayConfigured() {
  return Boolean(
    process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_FILE ||
      process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
  );
}

function serviceAccount(): ServiceAccount {
  if (cachedKey) return cachedKey;
  const json =
    process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON ||
    (process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_FILE
      ? readFileSync(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_FILE, "utf8")
      : null);
  if (!json) throw new Error("Google Play service account is not configured");
  const parsed = JSON.parse(json) as ServiceAccount;
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Google Play service account key is incomplete");
  }
  cachedKey = parsed;
  return parsed;
}

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }
  const sa = serviceAccount();
  const key = await importPKCS8(sa.private_key, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

async function api(path: string, init?: RequestInit) {
  const token = await accessToken();
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

/* ---------- purchases ---------- */

/** purchases.products resource (one-time products). */
export type ProductPurchase = {
  purchaseState?: number; // 0 purchased, 1 cancelled, 2 pending
  acknowledgementState?: number; // 0 not yet, 1 acknowledged
  consumptionState?: number;
  orderId?: string;
  purchaseTimeMillis?: string;
  obfuscatedExternalAccountId?: string;
  obfuscatedExternalProfileId?: string;
  regionCode?: string;
  purchaseType?: number; // 0 = test (license tester), 1 promo, 2 rewarded
  productId?: string;
};

export const PURCHASE_STATE = { PURCHASED: 0, CANCELLED: 1, PENDING: 2 } as const;

/** null = Google doesn't know this token (forged / wrong package). */
export async function getProductPurchase(
  productId: string,
  purchaseToken: string
): Promise<ProductPurchase | null> {
  const res = await api(
    `/applications/${encodeURIComponent(PLAY_PACKAGE)}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`
  );
  if (res.status === 400 || res.status === 404 || res.status === 410) {
    console.error(`[google-play] purchase lookup ${res.status}: ${await res.text()}`);
    return null;
  }
  if (!res.ok) {
    throw new Error(`Google purchase lookup failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as ProductPurchase;
}

/** Must happen within 3 days or Google refunds the purchase. */
export async function acknowledgeProductPurchase(
  productId: string,
  purchaseToken: string
): Promise<void> {
  const res = await api(
    `/applications/${encodeURIComponent(PLAY_PACKAGE)}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`,
    { method: "POST", body: "{}" }
  );
  if (res.ok) return;
  const text = await res.text();
  // Already acknowledged (e.g. by the app itself) — fine.
  if (res.status === 400 && /already.*acknowledg/i.test(text)) return;
  throw new Error(`Google acknowledge failed: ${res.status} ${text}`);
}

/* ---------- real-time developer notifications (Pub/Sub push) ---------- */

const googleJwks = createRemoteJWKSet(
  new URL(
    // Test override only (see API above).
    process.env.GOOGLE_OIDC_JWKS_URL ||
      "https://www.googleapis.com/oauth2/v3/certs"
  )
);

/**
 * Pub/Sub push subscriptions with authentication send
 * "Authorization: Bearer <Google-signed OIDC token>". We check the
 * signature, the audience (GOOGLE_PLAY_RTDN_AUDIENCE, the push URL) and,
 * if set, the service account it was issued for (GOOGLE_PLAY_RTDN_EMAIL).
 */
export async function verifyPubSubPush(authorization: string | null) {
  const audience = process.env.GOOGLE_PLAY_RTDN_AUDIENCE;
  if (!audience) throw new Error("GOOGLE_PLAY_RTDN_AUDIENCE is not configured");
  const token = authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, googleJwks, {
      audience,
      issuer: ["https://accounts.google.com", "accounts.google.com"],
    });
    const email = process.env.GOOGLE_PLAY_RTDN_EMAIL;
    if (email && (payload.email !== email || payload.email_verified !== true)) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("[google-play] Pub/Sub token rejected:", error);
    return false;
  }
}
