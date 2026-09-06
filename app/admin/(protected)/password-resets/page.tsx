import { CustomerRepository } from "@/app/lib/repositories/customerRepository";
import { PasswordResetRequestRepository } from "@/app/lib/repositories/passwordResetRequestRepository";
import ResetCustomerPasswordButton from "@/app/components/admin/ResetCustomerPasswordButton";
import MarkResolvedButton from "@/app/components/admin/MarkResolvedButton";

export default async function AdminPasswordResetsPage() {
  const pending = await PasswordResetRequestRepository.getPending();

  const rows = await Promise.all(
    pending.map(async (req: any) => {
      const customer = await CustomerRepository.getByPhone(
        req.phone
      );

      return { ...req, customer };
    })
  );

  return (
    <div>
      <h1
        style={{
          marginTop: 0,
          marginBottom: 10,
        }}
      >
        Password Reset Requests
      </h1>

      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: 30,
        }}
      >
        Pending : {rows.length}
      </p>

      <div style={{ overflowX: "auto" }}>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "var(--color-white)",
          minWidth: 600,
        }}
      >
        <thead>
          <tr
            style={{
              background: "var(--color-bg-subtle)",
            }}
          >
            <th align="left" style={{ padding: 14 }}>
              Phone
            </th>

            <th align="left">Requested</th>

            <th align="center">Reset</th>

            <th align="center">Status</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((req) => (
            <tr
              key={req.id}
              style={{
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <td style={{ padding: 14 }}>
                {req.phone}
              </td>

              <td>
                {new Date(
                  req.created_at
                ).toLocaleString("en-IN")}
              </td>

              <td align="center">
                {req.customer ? (
                  <ResetCustomerPasswordButton
                    customerId={req.customer.id}
                    customerPhone={req.customer.phone}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    No matching account
                  </span>
                )}
              </td>

              <td align="center">
                <MarkResolvedButton
                  requestId={req.id}
                />
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={4}
                align="center"
                style={{
                  padding: 30,
                }}
              >
                No pending requests.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      </div>
    </div>
  );
}
