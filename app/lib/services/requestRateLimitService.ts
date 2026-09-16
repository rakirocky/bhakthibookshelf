import "server-only";

// In-memory sliding-window throttle for abuse-prone POST endpoints
// (order creation, subscribe) — separate from LoginRateLimitService,
// which tracks failed-credential attempts in the DB. This tracks raw
// request volume regardless of success/failure, and doesn't need to
// survive a restart, so an in-memory Map is enough: the app runs as a
// single pm2 fork-mode process (see [[prod-server]] memory), not a
// cluster, so there's only ever one process's worth of state to track.
const requestLog = new Map<string, number[]>();

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function checkRequestRateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const timestamps = (requestLog.get(key) ?? []).filter(
    (t) => now - t < windowMs
  );

  if (timestamps.length >= max) {
    const oldest = timestamps[0];
    const retryAfterSeconds = Math.ceil(
      (windowMs - (now - oldest)) / 1000
    );
    requestLog.set(key, timestamps);
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  requestLog.set(key, timestamps);
  return { allowed: true };
}

// nginx (see prod nginx config) sets X-Real-IP and X-Forwarded-For —
// used to key rate limits for endpoints reachable without a session
// (guest checkout on /api/orders).
export function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return "unknown";
}
