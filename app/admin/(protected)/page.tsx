import DashboardCard from "../../components/admin/DashboardCard";
import QuickActionCard from "../../components/admin/QuickActionCard";

import {
  getDashboardBookCount,
  getDashboardLatestBooks,
} from "../../lib/services/book-service";

import { OrderService } from "../../lib/services/orderService";

export default async function AdminDashboardPage() {
  const [
    totalBooks,
    totalOrders,
    totalRevenue,
    latestBooks,
    recentOrders,
  ] = await Promise.all([
    getDashboardBookCount(),
    OrderService.getDashboardOrderCount(),
    OrderService.getDashboardRevenue(),
    OrderService.getDashboardRecentOrders(),
    getDashboardLatestBooks(),
  ]);

  return (
    <>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
          marginBottom: 40,
        }}
      >
        <DashboardCard
          title="Books"
          value={totalBooks}
          subtitle="Published books"
        />

        <DashboardCard
          title="Orders"
          value={totalOrders}
          subtitle="Orders received"
        />

        <DashboardCard
          title="Revenue"
          value={`₹${totalRevenue}`}
          subtitle="Total revenue"
        />

        <DashboardCard
          title="Latest Books"
          value={latestBooks.length}
          subtitle="Recent additions"
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 30,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            background: "var(--color-white)",
            padding: 25,
            borderRadius: 12,
            border: "1px solid var(--color-border)",
          }}
        >
          <h2>Recent Orders</h2>

          {recentOrders.length === 0 ? (
            <p>No orders available.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th align="left">Order</th>
                  <th align="left">Customer</th>
                  <th align="right">Amount</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order: any) => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>{order.customer_name}</td>
                    <td align="right">
                      ₹{order.total_amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div
          style={{
            background: "var(--color-white)",
            padding: 25,
            borderRadius: 12,
            border: "1px solid var(--color-border)",
          }}
        >
          <h2>Latest Books</h2>

          {latestBooks.length === 0 ? (
            <p>No books available.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th align="left">Title</th>
                  <th align="left">Author</th>
                  <th align="right">Price</th>
                </tr>
              </thead>

              <tbody>
                {latestBooks.map((book: any) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td align="right">
                      ₹{book.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section
        style={{
          marginTop: 40,
        }}
      >
        <h2>Quick Actions</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 20,
          }}
        >
          <QuickActionCard
            title="Manage Books"
            description="Create and edit books."
            href="/admin/books"
          />

          <QuickActionCard
            title="Orders"
            description="View customer orders."
            href="/admin/orders"
          />

          <QuickActionCard
            title="Reports"
            description="Sales reports."
            href="/admin/reports"
          />

          <QuickActionCard
            title="Settings"
            description="Configure application."
            href="/admin/settings"
          />
        </div>
      </section>
    </>
  );
}
