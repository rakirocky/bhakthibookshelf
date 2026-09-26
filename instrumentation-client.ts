import { reportClientError } from "./app/lib/monitoring/reportClientError";

// Browser errors → /api/client-errors → Sentry (server side). Tiny on
// purpose: no monitoring SDK in the page bundle. Errors caught by React
// error boundaries are reported from app/error.tsx / app/global-error.tsx.
try {
  window.addEventListener("error", (event) => {
    reportClientError(event.error ?? event.message, "window.error");
  });
  window.addEventListener("unhandledrejection", (event) => {
    reportClientError(event.reason, "unhandledrejection");
  });
} catch {
  /* never let monitoring break the page */
}

/** Turns on the page-to-page glide (modern.css) from the first in-app navigation on. */
export function onRouterTransitionStart() {
  document.documentElement.classList.add("page-anim");
}
