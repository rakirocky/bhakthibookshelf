import Link from "next/link";
import { Suspense } from "react";

function buildHref(base: string, from: string) {
  if (!from) {
    return base;
  }

  return `${base}?from=${encodeURIComponent(from)}`;
}

async function RequiredNotice({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const from = params.from ?? "";

  return (
    <div style={pageWrapStyle}>
      <div style={cardStyle}>
        <div
          style={{
            fontSize: 40,
            marginBottom: 10,
          }}
        >
          🔒
        </div>

        <h1 style={titleStyle}>Sign In Required</h1>

        <p style={textStyle}>
          You'll need an account to continue. If you already have
          one, sign in below — if not, creating one only takes a
          minute.
        </p>

        <Link
          href={buildHref("/account/login", from)}
          className="btn btn-primary btn-block"
          style={{ textDecoration: "none" }}
        >
          Log In
        </Link>

        <Link
          href={buildHref("/account/signup", from)}
          className="btn btn-outline btn-block"
          style={{
            textDecoration: "none",
            marginTop: 12,
          }}
        >
          Create an Account
        </Link>
      </div>
    </div>
  );
}

export default function SignInRequiredPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <RequiredNotice searchParams={searchParams} />
    </Suspense>
  );
}

const pageWrapStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--color-bg-page)",
  padding: 20,
} as const;

const cardStyle = {
  width: "100%",
  maxWidth: 380,
  textAlign: "center" as const,
  background: "var(--color-white)",
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: 36,
  boxShadow: "0 12px 30px rgba(0,0,0,.05)",
};

const titleStyle = {
  marginTop: 0,
  marginBottom: 12,
  color: "var(--color-navy)",
  fontSize: 22,
} as const;

const textStyle = {
  color: "var(--color-text-secondary)",
  fontSize: 14,
  lineHeight: 1.6,
  marginBottom: 26,
} as const;
