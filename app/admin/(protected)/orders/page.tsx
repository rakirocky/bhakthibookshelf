import Link from "next/link";

import StatusBadge from "@/app/components/admin/StatusBadge";
import { OrderService } from "@/app/lib/services/orderService";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ promoter?: string }>;
}) {
  const params = await searchParams;
  const promoterFilter = params.promoter;

  const orders = await OrderService.getAllOrders(
    promoterFilter
  );

  return (
    <div>
      <div
        style={{
          marginBottom: 30,
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: 10,
          }}
        >
          Orders
        </h1>

        <p
          style={{
            color: "var(--color-text-secondary)",
          }}
        >
          Total Orders : {orders.length}
        </p>

        {promoterFilter && (
          <div
            style={{
              marginTop: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "var(--color-bg-subtle)",
              padding: "8px 14px",
              borderRadius: "var(--radius-pill)",
              fontSize: 13,
            }}
          >
            Showing only orders referred by{" "}
            <strong>{promoterFilter}</strong>

            <Link
              href="/admin/orders"
              style={{
                color: "var(--color-danger-text)",
                fontWeight: 600,
              }}
            >
              Clear filter ×
            </Link>
          </div>
        )}
      </div>

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
              Order #
            </th>

            <th align="left">Customer</th>

            <th align="left">Promoter</th>

            <th align="right">Amount</th>

            <th align="center">Payment</th>

            <th align="center">Status</th>

            <th align="left">Date</th>

            <th align="center">Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order: any) => (
            <tr
              key={order.id}
              style={{
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <td style={{ padding: 14 }}>
                {order.order_number}
              </td>

              <td>
                {order.customer_name}
                <br />
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                  }}
                >
                  {order.email}
                </span>
              </td>

              <td>
                {order.promoter_name ? (
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--color-navy)",
                      fontWeight: 600,
                    }}
                  >
                    {order.promoter_name}
                    <br />
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-muted)",
                        fontWeight: 400,
                      }}
                    >
                      {order.promoter_code}
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

              <td align="right">
                ₹{order.total_amount}
              </td>

              <td align="center">
                <StatusBadge status={order.payment_status} />
              </td>

              <td align="center">
                <StatusBadge status={order.order_status} />
              </td>

              <td>
                {new Date(order.created_at).toLocaleDateString(
                  "en-IN"
                )}
              </td>

              <td align="center">
                <Link href={`/admin/orders/${order.id}`}>
                  View
                </Link>
                {" · "}
                <a
                  href={`/api/admin/orders/${order.id}/invoice`}
                >
                  Invoice
                </a>
              </td>
            </tr>
          ))}

          {orders.length === 0 && (
            <tr>
              <td
                colSpan={8}
                align="center"
                style={{
                  padding: 30,
                }}
              >
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      </div>
    </div>
  );
}
