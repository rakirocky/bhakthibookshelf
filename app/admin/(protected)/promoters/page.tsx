import Link from "next/link";

import { PromoterService } from "@/app/lib/services/promoterService";
import AddPromoterForm from "@/app/components/admin/AddPromoterForm";
import PromoterActiveToggle from "@/app/components/admin/PromoterActiveToggle";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010";

export default async function AdminPromotersPage() {
  const promoters = await PromoterService.getAllWithStats();

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              marginTop: 0,
              marginBottom: 10,
            }}
          >
            Promoters
          </h1>

          <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
            Total Promoters : {promoters.length}
          </p>
        </div>

        <AddPromoterForm />
      </div>

      <div style={{ overflowX: "auto" }}>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "var(--color-white)",
          minWidth: 900,
        }}
      >
        <thead>
          <tr
            style={{
              background: "var(--color-bg-subtle)",
            }}
          >
            <th align="left" style={{ padding: 14 }}>
              Name
            </th>

            <th align="left">Referral Link</th>

            <th align="center">Orders</th>

            <th align="center">Subs</th>

            <th align="right">Revenue</th>

            <th align="center">Rate</th>

            <th align="right">Commission Owed</th>

            <th align="center">Status</th>

            <th align="center">Action</th>
          </tr>
        </thead>

        <tbody>
          {promoters.map((p: any) => (
            <tr
              key={p.id}
              style={{
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <td style={{ padding: 14 }}>
                {p.name}
                <br />
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                  }}
                >
                  {p.contact_phone || "—"}
                </span>
              </td>

              <td
                style={{
                  fontSize: 13,
                  color: "#555",
                  fontFamily: "monospace",
                }}
              >
                {siteUrl}/?ref={p.code}
              </td>

              <td align="center">
                <Link
                  href={`/admin/orders?promoter=${p.code}`}
                  style={{
                    color: "var(--color-primary)",
                    fontWeight: 600,
                    textDecoration: "underline",
                  }}
                >
                  {p.paid_order_count}
                </Link>
              </td>

              <td align="center">
                <Link
                  href={`/admin/subscriptions?promoter=${p.code}`}
                  style={{
                    color: "var(--color-primary)",
                    fontWeight: 600,
                    textDecoration: "underline",
                  }}
                >
                  {p.paid_subscription_count}
                </Link>
              </td>

              <td align="right">
                ₹{Number(p.paid_revenue).toFixed(2)}
              </td>

              <td align="center">
                {p.commission_rate}%
              </td>

              <td
                align="right"
                style={{ fontWeight: 600 }}
              >
                ₹{Number(p.commission_owed).toFixed(2)}
              </td>

              <td align="center">
                <span
                  style={{
                    background: p.is_active
                      ? "var(--color-success-bg)"
                      : "var(--color-danger-bg)",
                    color: p.is_active
                      ? "var(--color-success-text)"
                      : "var(--color-danger-text)",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.is_active ? "ACTIVE" : "INACTIVE"}
                </span>
              </td>

              <td align="center">
                <PromoterActiveToggle
                  promoterId={p.id}
                  isActive={p.is_active}
                />
              </td>
            </tr>
          ))}

          {promoters.length === 0 && (
            <tr>
              <td
                colSpan={9}
                align="center"
                style={{
                  padding: 30,
                }}
              >
                No promoters yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      </div>
    </div>
  );
}
