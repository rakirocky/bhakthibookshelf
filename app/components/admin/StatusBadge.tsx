const COLORS: Record<
  string,
  { bg: string; color: string }
> = {
  CREATED: { bg: "#e0e7ff", color: "#3730a3" },
  CONFIRMED: { bg: "#dbeafe", color: "#1e40af" },
  SHIPPED: { bg: "var(--color-warning-bg)", color: "var(--color-warning-text)" },
  DELIVERED: { bg: "var(--color-success-bg)", color: "var(--color-success-text)" },
  CANCELLED: { bg: "var(--color-danger-bg)", color: "var(--color-danger-text)" },
  PENDING: { bg: "var(--color-warning-bg)", color: "var(--color-warning-text)" },
  PAID: { bg: "var(--color-success-bg)", color: "var(--color-success-text)" },
  FAILED: { bg: "var(--color-danger-bg)", color: "var(--color-danger-text)" },
  REFUNDED: { bg: "#f3e8ff", color: "#6b21a8" },
  ACTIVE: { bg: "var(--color-success-bg)", color: "var(--color-success-text)" },
  INACTIVE: { bg: "#f3f4f6", color: "#6b7280" },
};

export default function StatusBadge({
  status,
}: {
  status: string;
}) {
  const style =
    COLORS[status] ?? {
      bg: "#f3f4f6",
      color: "#374151",
    };

  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}
