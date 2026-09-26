"use client";

import { useEffect } from "react";

import { reportClientError } from "./lib/monitoring/reportClientError";

/**
 * Last-resort fallback when the root layout itself fails — replaces the
 * whole page, so no providers, translations or site CSS here.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error, "global-error", error.digest);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fdf0d5", color: "#3f2f24" }}>
        <main style={{ maxWidth: 520, margin: "15vh auto", padding: "0 20px", textAlign: "center" }}>
          <h1 style={{ color: "#7c2d12" }}>🙏 Something went wrong</h1>
          <p>Sorry — the page couldn&apos;t load. Please try again in a moment.</p>
          <p lang="kn">ಕ್ಷಮಿಸಿ — ಪುಟ ತೆರೆಯಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.</p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 16, padding: "12px 28px", border: 0, borderRadius: 999, background: "#b45309", color: "#fff", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
