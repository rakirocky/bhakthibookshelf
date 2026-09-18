import Link from "next/link";

import { CustomerRepository } from "@/app/lib/repositories/customerRepository";
import ResetCustomerPasswordButton from "@/app/components/admin/ResetCustomerPasswordButton";
import ManageDownloadsButton from "@/app/components/admin/ManageDownloadsButton";
import ForceLogoutButton from "@/app/components/admin/ForceLogoutButton";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ promoter?: string }>;
}) {
  const params = await searchParams;
  const promoterFilter = params.promoter;

  const customers = await CustomerRepository.getAll(
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
        Customers
      </h1>

      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: promoterFilter ? 12 : 30,
        }}
      >
        Total Customers : {customers.length}
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
          Showing only customers referred by{" "}
          <strong>{promoterFilter}</strong>

          <Link
            href="/admin/customers"
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
          minWidth: 950,
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

            <th align="left">Phone</th>

            <th align="left">Email</th>

            <th align="left">Referred By</th>

            <th align="center">Session</th>

            <th align="left">Joined</th>

            <th align="center">Action</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer: any) => (
            <tr
              key={customer.id}
              style={{
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <td style={{ padding: 14 }}>
                {customer.name || "—"}
              </td>

              <td>{customer.phone}</td>

              <td>{customer.email || "—"}</td>

              <td>
                {customer.referred_by_promoter_name ? (
                  <span style={{ fontSize: 13 }}>
                    {customer.referred_by_promoter_name}
                    <br />
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {customer.referred_by_promoter_code}
                    </span>
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
                {customer.has_active_session ? (
                  <span
                    style={{
                      background: "var(--color-success-bg)",
                      color: "var(--color-success-text)",
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ACTIVE
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-faint)",
                    }}
                  >
                    None
                  </span>
                )}
              </td>

              <td>
                {new Date(
                  customer.created_at
                ).toLocaleDateString("en-IN")}
              </td>

              <td align="center">
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <ResetCustomerPasswordButton
                    customerId={customer.id}
                    customerPhone={customer.phone}
                  />

                  <ManageDownloadsButton
                    customerId={customer.id}
                  />

                  {customer.has_active_session && (
                    <ForceLogoutButton
                      customerId={customer.id}
                      customerPhone={customer.phone}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}

          {customers.length === 0 && (
            <tr>
              <td
                colSpan={7}
                align="center"
                style={{
                  padding: 30,
                }}
              >
                No customers yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      </div>
    </div>
  );
}
