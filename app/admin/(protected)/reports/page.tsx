import type { CSSProperties } from "react";
import DashboardCard from "../../../components/admin/DashboardCard";
import MonthlyBarChart from "../../../components/admin/MonthlyBarChart";
import { ReportsService } from "../../../lib/services/reportsService";

const cardStyle: CSSProperties = {
  background: "var(--color-white)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  padding: 30,
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 20,
};

export default async function AdminReportsPage() {
  const [
    monthlyRevenue,
    topBooks,
    subscriptionBreakdown,
    conversionStats,
    monthlyCustomerGrowth,
  ] = await Promise.all([
    ReportsService.getMonthlyRevenue(12),
    ReportsService.getTopBooks(10),
    ReportsService.getSubscriptionBreakdown(),
    ReportsService.getConversionStats(),
    ReportsService.getMonthlyCustomerGrowth(12),
  ]);

  return (
    <div>
      <h1 style={{ marginTop: 0, marginBottom: 10 }}>Reports</h1>

      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: 30,
        }}
      >
        Sales reports and analytics.
      </p>

      <section
        style={{
          ...cardStyle,
          marginBottom: 30,
        }}
      >
        <h2 style={sectionTitleStyle}>Revenue — last 12 months</h2>

        <p
          style={{
            marginTop: -12,
            marginBottom: 20,
            color: "var(--color-text-muted)",
            fontSize: 13,
          }}
        >
          Orders + subscriptions, paid only. Hover a bar for the exact figure.
        </p>

        <MonthlyBarChart
          data={monthlyRevenue.map((m) => ({
            label: m.label,
            value: m.revenue,
          }))}
          formatValue={(v) => `₹${v.toLocaleString("en-IN")}`}
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 30,
          marginBottom: 30,
        }}
      >
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Top Books by Revenue</h2>

          {topBooks.length === 0 ? (
            <p>No paid orders yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Title</th>
                  <th align="right">Copies</th>
                  <th align="right">Revenue</th>
                </tr>
              </thead>

              <tbody>
                {topBooks.map((book: any) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td align="right">{book.copies_sold}</td>
                    <td align="right">
                      ₹{Number(book.revenue).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Subscription Conversions</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <DashboardCard
              title="Customers"
              value={conversionStats.total_customers}
            />

            <DashboardCard
              title="Subscribed"
              value={conversionStats.subscribed_customers}
            />

            <DashboardCard
              title="Conversion"
              value={`${conversionStats.conversionRate}%`}
            />
          </div>

          {subscriptionBreakdown.length === 0 ? (
            <p>No subscription plans configured.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Plan</th>
                  <th align="right">Paid subs</th>
                  <th align="right">Revenue</th>
                </tr>
              </thead>

              <tbody>
                {subscriptionBreakdown.map((plan: any) => (
                  <tr key={plan.id}>
                    <td>{plan.name}</td>
                    <td align="right">{plan.paid_count}</td>
                    <td align="right">
                      ₹{Number(plan.revenue).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Customer Growth — last 12 months</h2>

        <p
          style={{
            marginTop: -12,
            marginBottom: 20,
            color: "var(--color-text-muted)",
            fontSize: 13,
          }}
        >
          New customer signups per month.
        </p>

        <MonthlyBarChart
          data={monthlyCustomerGrowth.map((m) => ({
            label: m.label,
            value: m.new_customers,
          }))}
        />
      </section>
    </div>
  );
}
