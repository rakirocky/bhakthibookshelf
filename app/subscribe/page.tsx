import Link from "next/link";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { SubscriptionService } from "@/app/lib/services/subscriptionService";
import SubscribeButton from "@/app/components/subscribe/SubscribeButton";
import { getT } from "@/app/lib/i18n/server";

// Plan list and subscription status are both live data.
export const dynamic = "force-dynamic";

export default async function SubscribePage() {
  const t = await getT();
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
          {t("sub.title")}
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-secondary)",
            marginBottom: 40,
          }}
        >
          {t("sub.text")}
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
                {plan.duration_days
                  ? t("sub.perDays", { days: plan.duration_days })
                  : t("sub.oneTime")}
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
              <li>{t("sub.every")}</li>
              <li>
                {plan.duration_days
                  ? t("sub.newDuring")
                  : t("sub.newForever")}
              </li>
              <li>
                {plan.duration_days
                  ? t("sub.anyDevice")
                  : t("sub.noRenewal")}
              </li>
            </ul>

            {!session && (
              <Link
                href={`/account/login?from=/subscribe`}
                className="btn btn-primary btn-block"
                style={{ textDecoration: "none" }}
              >
                {t("sub.signIn")}
              </Link>
            )}

            {session && status?.status === "ACTIVE" && (
              <div style={statusBoxStyle("var(--color-success-bg)", "var(--color-success-text)")}>
                {status.subscription!.ends_at
                  ? t("account.activeUntil", { date: new Date(status.subscription!.ends_at as string).toLocaleDateString("en-IN") })
                  : t("account.lifetime")}
              </div>
            )}

            {session && status?.status === "PENDING" && (
              <div style={statusBoxStyle("var(--color-warning-bg)", "var(--color-warning-text)")}>
                {t("sub.pending")}
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
