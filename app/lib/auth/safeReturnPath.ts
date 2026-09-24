/**
 * The ?from= return path after sign-in/sign-up, restricted to this site.
 * Anything else ("https://evil.example", "//evil.example", "/\\evil")
 * falls back, so a crafted login link can't bounce a customer off-site
 * right after they enter their password.
 */
export function safeReturnPath(
  from: string | null,
  fallback = "/account"
): string {
  if (!from || !from.startsWith("/") || from.startsWith("//") || from.startsWith("/\\")) {
    return fallback;
  }

  return from;
}
