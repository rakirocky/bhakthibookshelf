const ENDPOINT = "/api/client-errors";
const MAX_PER_PAGE = 5;

let sent = 0;
const seen = new Set<string>();

/**
 * Sends a browser error to /api/client-errors (which forwards it to
 * Sentry when that's configured). At most a few per page load and each
 * distinct message once, so a crash loop can't flood anything.
 */
export function reportClientError(error: unknown, source: string, digest?: string) {
  try {
    const err = error instanceof Error ? error : new Error(String(error ?? "Unknown error"));
    const key = `${err.name}:${err.message}`;
    if (sent >= MAX_PER_PAGE || seen.has(key)) return;
    seen.add(key);
    sent += 1;

    const body = JSON.stringify({
      name: err.name,
      message: err.message.slice(0, 500),
      stack: (err.stack ?? "").slice(0, 4000),
      source,
      digest,
      url: window.location.href.slice(0, 500),
      app: document.documentElement.hasAttribute("data-app"),
    });

    if (!navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "application/json" }))) {
      void fetch(ENDPOINT, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
    }
  } catch {
    /* reporting must never throw */
  }
}
