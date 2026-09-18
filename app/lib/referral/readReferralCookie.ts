// Client-side helper for the login/signup forms: proxy.ts sets
// `promoter_ref` as a non-httpOnly cookie specifically so this can read
// it and pre-fill the referral code field when someone arrives via a
// ?ref= link, without a server round trip. Returns null outside the
// browser (SSR) or if the cookie isn't set.
export function readReferralCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    /(?:^|;\s*)promoter_ref=([^;]+)/
  );

  return match ? decodeURIComponent(match[1]) : null;
}
