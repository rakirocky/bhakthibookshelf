import Link from "next/link";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { SubscriptionService } from "@/app/lib/services/subscriptionService";
import SubscribeButton from "@/app/components/subscribe/SubscribeButton";

// Plan list and subscription status are both live data.
export const dynamic = "force-dynamic";

export default async function SubscribePage() {
  const [plans, session] = await Promise.all([
    SubscriptionService.getActivePlans(),
    getCustomerSession(),
  ]);

  const status = session
    ? await SubscriptionService.getStatusForCustomer(
        session.customerId
      )
    : null;

  return (
    <div style={pageWrapStyle}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1
          style={{
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Unlock the Full Library
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-secondary)",
            marginBottom: 40,
          }}
        >
          One subscription, every book — including new
          releases added during your year.
        </p>

        {plans.map((plan: any) => (
          <div key={plan.id} style={cardStyle}>
            <h2
              style={{
                marginTop: 0,
                color: "var(--color-primary)",
              }}
            >
              {plan.name}
            </h2>

            <p
              style={{
                fontSize: 40,
                fontWeight: 700,
                margin: "10px 0",
              }}
            >
              ₹{plan.price}
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  color: "var(--color-text-muted)",
                }}
              >
                {" "}
                / {plan.duration_days} days
              </span>
            </p>

            <ul
              style={{
                margin: "20px 0 30px",
                paddingLeft: 20,
                color: "var(--color-text-strong)",
                lineHeight: 1.9,
              }}
            >
              <li>Access to every book in the library</li>
              <li>
                Includes new titles added during your
                subscription
              </li>
              <li>Read on any device</li>
            </ul>

            {!session && (
              <Link
                href={`/account/login?from=/subscribe`}
                className="btn btn-primary btn-block"
                style={{ textDecoration: "none" }}
              >
                Sign In to Subscribe
              </Link>
            )}

            {session && status?.status === "ACTIVE" && (
              <div style={statusBoxStyle("var(--color-success-bg)", "var(--color-success-text)")}>
                ✓ Active until{" "}
                {new Date(
                  status.subscription!.ends_at as string
                ).toLocaleDateString("en-IN")}
              </div>
            )}

            {session && status?.status === "PENDING" && (
              <div style={statusBoxStyle("var(--color-warning-bg)", "var(--color-warning-text)")}>
                Payment pending — we'll activate your
                subscription once it's confirmed.
              </div>
            )}

            {session &&
              (status?.status === "NONE" ||
                status?.status === "EXPIRED") && (
                <SubscribeButton planId={plan.id} />
              )}
          </div>
        ))}
      </div>
    </div>
  );
}

const pageWrapStyle = {
  padding: "60px 20px",
} as const;

const cardStyle = {
  background: "var(--color-white)",
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: 36,
  boxShadow: "0 12px 30px rgba(0,0,0,.05)",
} as const;

function statusBoxStyle(bg: string, color: string) {
  return {
    background: bg,
    color,
    padding: "14px 18px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    textAlign: "center" as const,
  };
}
