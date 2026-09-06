interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
}: DashboardCardProps) {
  return (
    <div
      style={{
        background: "var(--color-white)",
        borderRadius: 12,
        padding: 24,
        border: "1px solid var(--color-border)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <h3
        style={{
          margin: 0,
          color: "var(--color-text-secondary)",
          fontSize: 15,
        }}
      >
        {title}
      </h3>

      <h2
        style={{
          marginTop: 18,
          marginBottom: 10,
          fontSize: 36,
          color: "var(--color-primary)",
        }}
      >
        {value}
      </h2>

      {subtitle && (
        <p
          style={{
            margin: 0,
            color: "var(--color-text-muted)",
            fontSize: 14,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
