import { CustomerRepository } from "@/app/lib/repositories/customerRepository";
import ResetCustomerPasswordButton from "@/app/components/admin/ResetCustomerPasswordButton";

export default async function AdminCustomersPage() {
  const customers = await CustomerRepository.getAll();

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
          marginBottom: 30,
        }}
      >
        Total Customers : {customers.length}
      </p>

      <div style={{ overflowX: "auto" }}>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "var(--color-white)",
          minWidth: 700,
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
                {new Date(
                  customer.created_at
                ).toLocaleDateString("en-IN")}
              </td>

              <td align="center">
                <ResetCustomerPasswordButton
                  customerId={customer.id}
                  customerPhone={customer.phone}
                />
              </td>
            </tr>
          ))}

          {customers.length === 0 && (
            <tr>
              <td
                colSpan={5}
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
