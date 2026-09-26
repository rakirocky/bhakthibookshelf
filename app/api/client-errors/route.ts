import { NextResponse } from "next/server";

/**
 * Receives browser errors from app/lib/monitoring/reportClientError.ts
 * and forwards them to Sentry. A no-op (204) when SENTRY_DSN isn't set.
 * Public and unauthenticated, so: size-capped, fields truncated, and a
 * small per-IP rate limit.
 */

const MAX_BODY = 10_000;
const LIMIT_PER_MINUTE = 20;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    if (hits.size > 5000) hits.clear();
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT_PER_MINUTE;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);

export async function POST(request: Request) {
  if (!process.env.SENTRY_DSN) return new NextResponse(null, { status: 204 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return new NextResponse(null, { status: 429 });

  const text = await request.text().catch(() => "");
  if (!text || text.length > MAX_BODY) return new NextResponse(null, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const message = str(body.message, 500);
  if (!message) return new NextResponse(null, { status: 400 });

  const error = new Error(message);
  error.name = str(body.name, 100) || "Error";
  error.stack = str(body.stack, 4000) || `${error.name}: ${message}`;

  const Sentry = await import("@sentry/nextjs");
  Sentry.withScope((scope) => {
    scope.setTag("side", "browser");
    scope.setTag("source", str(body.source, 50) ?? "unknown");
    scope.setTag("platform", body.app === true ? "android-app" : "web");
    const digest = str(body.digest, 100);
    if (digest) scope.setTag("digest", digest);
    scope.setContext("page", {
      url: str(body.url, 500),
      userAgent: request.headers.get("user-agent")?.slice(0, 300),
    });
    Sentry.captureException(error);
  });

  return new NextResponse(null, { status: 204 });
}
