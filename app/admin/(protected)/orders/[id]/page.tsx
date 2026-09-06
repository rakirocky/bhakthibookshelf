import { notFound } from "next/navigation";

import OrderStatusForm from "@/app/components/admin/OrderStatusForm";
import StatusBadge from "@/app/components/admin/StatusBadge";
import { OrderService } from "@/app/lib/services/orderService";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await OrderService.getOrderDetail(
    Number(id)
  );

  if (!order) {
    notFound();
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h1 style={{ marginBottom: 6 }}>
          Order {order.order_number}
        </h1>

        <a
          href={`/api/admin/orders/${order.id}/invoice`}
          className="btn btn-outline"
          style={{
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          📄 Download Invoice
        </a>
      </div>

      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: 30,
        }}
      >
        Placed on{" "}
        {new Date(order.created_at).toLocaleString(
          "en-IN"
        )}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 30,
          marginBottom: 30,
        }}
      >
        <div
          style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: 25,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Customer</h2>

          <p style={{ margin: "4px 0" }}>
            {order.customer_name}
          </p>

          <p style={{ margin: "4px 0" }}>
            {order.email}
          </p>

          <p style={{ margin: "4px 0" }}>
            {order.mobile}
          </p>

          <p style={{ margin: "4px 0" }}>
            {order.address}, {order.city}, {order.state} -{" "}
            {order.pincode}, {order.country}
          </p>

          {order.gst_number && (
            <p style={{ margin: "4px 0" }}>
              GST: {order.gst_number}
            </p>
          )}

          <p
            style={{
              margin: "16px 0 0",
              paddingTop: 14,
              borderTop: "1px solid #f0f0f0",
              fontSize: 13,
              color: "var(--color-text-secondary)",
            }}
          >
            Referred by:{" "}
            {order.promoter_name ? (
              <strong style={{ color: "var(--color-navy)" }}>
                {order.promoter_name} ({order.promoter_code})
              </strong>
            ) : (
              <span style={{ color: "var(--color-text-faint)" }}>
                Direct (no promoter)
              </span>
            )}
          </p>
        </div>

        <div
          style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: 25,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Status</h2>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <StatusBadge status={order.order_status} />
            <StatusBadge status={order.payment_status} />
          </div>

          <OrderStatusForm
            orderId={order.id}
            currentOrderStatus={order.order_status}
            currentPaymentStatus={order.payment_status}
          />
        </div>
      </div>

      <div
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: 25,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Items</h2>

        <div style={{ overflowX: "auto" }}>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 480,
          }}
        >
          <thead>
            <tr
              style={{
                background: "var(--color-bg-subtle)",
              }}
            >
              <th align="left" style={{ padding: 10 }}>
                Book
              </th>

              <th align="center">Qty</th>

              <th align="right">Price</th>

              <th align="right">Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item: any) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <td style={{ padding: 10 }}>
                  {item.book_title}
                </td>

                <td align="center">
                  {item.quantity}
                </td>

                <td align="right">₹{item.price}</td>

                <td align="right">
                  ₹{item.subtotal}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <td
                colSpan={3}
                align="right"
                style={{
                  padding: 10,
                  fontWeight: 600,
                }}
              >
                Total
              </td>

              <td
                align="right"
                style={{
                  fontWeight: 600,
                }}
              >
                ₹{order.total_amount}
              </td>
            </tr>
          </tfoot>
        </table>

        </div>
      </div>
    </div>
  );
}
