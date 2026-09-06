import Link from "next/link";

import StatusBadge from "@/app/components/admin/StatusBadge";
import MarkSubscriptionPaidButton from "@/app/components/admin/MarkSubscriptionPaidButton";
import { SubscriptionService } from "@/app/lib/services/subscriptionService";

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ promoter?: string }>;
}) {
  const params = await searchParams;
  const promoterFilter = params.promoter;

  const subscriptions = await SubscriptionService.getAllForAdmin(
    promoterFilter
  );

  return (
    <div>
      <h1
        style={{
          marginTop: 0,
          marginBottom: 10,
        }}
      >
        Subscriptions
      </h1>

      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: promoterFilter ? 12 : 30,
        }}
      >
        Total : {subscriptions.length}
      </p>

      {promoterFilter && (
        <div
          style={{
            marginBottom: 30,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "var(--color-bg-subtle)",
            padding: "8px 14px",
            borderRadius: "var(--radius-pill)",
            fontSize: 13,
          }}
        >
          Showing only subscriptions referred by{" "}
          <strong>{promoterFilter}</strong>

          <Link
            href="/admin/subscriptions"
            style={{
              color: "var(--color-danger-text)",
              fontWeight: 600,
            }}
          >
            Clear filter ×
          </Link>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "var(--color-white)",
          minWidth: 800,
        }}
      >
        <thead>
          <tr
            style={{
              background: "var(--color-bg-subtle)",
            }}
          >
            <th align="left" style={{ padding: 14 }}>
              Customer
            </th>

            <th align="left">Plan</th>

            <th align="right">Amount</th>

            <th align="left">Promoter</th>

            <th align="center">Status</th>

            <th align="left">Expires</th>

            <th align="center">Action</th>
          </tr>
        </thead>

        <tbody>
          {subscriptions.map((sub: any) => (
            <tr
              key={sub.id}
              style={{
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <td style={{ padding: 14 }}>
                {sub.customer_name || "—"}
                <br />
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                  }}
                >
                  {sub.customer_phone}
                </span>
              </td>

              <td>{sub.plan_name}</td>

              <td align="right">₹{sub.amount}</td>

              <td>
                {sub.promoter_name ? (
                  <span style={{ fontSize: 13 }}>
                    {sub.promoter_name}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-faint)",
                    }}
                  >
                    Direct
                  </span>
                )}
              </td>

              <td align="center">
                <StatusBadge status={sub.payment_status} />
              </td>

              <td>
                {sub.ends_at
                  ? new Date(
                      sub.ends_at
                    ).toLocaleDateString("en-IN")
                  : "—"}
              </td>

              <td align="center">
                {sub.payment_status === "PENDING" && (
                  <MarkSubscriptionPaidButton
                    subscriptionId={sub.id}
                  />
                )}
              </td>
            </tr>
          ))}

          {subscriptions.length === 0 && (
            <tr>
              <td
                colSpan={7}
                align="center"
                style={{
                  padding: 30,
                }}
              >
                No subscriptions yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      </div>
    </div>
  );
}
