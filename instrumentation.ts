import type { Instrumentation } from "next";

/**
 * Error monitoring (Sentry), server side only — the browser bundle stays
 * Sentry-free; browser errors reach Sentry through /api/client-errors
 * (see instrumentation-client.ts).
 *
 * Off unless SENTRY_DSN is set in the environment (.env.local on the
 * server), so local development and a missing key never send anything.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
      // errors only — no performance tracing (keeps us well inside the free tier)
      // (Sentry v11 sends no IP addresses / cookies / request bodies by default)
      tracesSampleRate: 0,
      // SENTRY_DEBUG=1 logs what the SDK does (for checking the setup)
      debug: process.env.SENTRY_DEBUG === "1",
    });
  }
}

/** Errors in server components, route handlers and server actions. */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(err, request, context);
};
