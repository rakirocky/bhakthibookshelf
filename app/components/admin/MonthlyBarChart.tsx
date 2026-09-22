interface MonthlyBarChartProps {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
}

// Plain server-rendered bars — no chart library, matches the rest of the
// admin area. Single series, so one flat hue (brand primary) rather than a
// categorical palette; the native `title` attribute gives every bar a
// hover tooltip with the exact figure without needing client JS.
export default function MonthlyBarChart({
  data,
  formatValue = (v) => String(v),
}: MonthlyBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        height: 160,
        padding: "10px 4px 0",
      }}
    >
      {data.map((d) => {
        const heightPct = Math.round((d.value / max) * 100);
        const [month] = d.label.split(" ");

        return (
          <div
            key={d.label}
            title={`${d.label}: ${formatValue(d.value)}`}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              cursor: "default",
            }}
          >
            <div
              style={{
                width: "100%",
                height: 120,
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${Math.max(heightPct, d.value > 0 ? 3 : 0)}%`,
                  background: "var(--color-primary)",
                  borderRadius: "4px 4px 0 0",
                  minHeight: d.value > 0 ? 2 : 0,
                }}
              />
            </div>

            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
              }}
            >
              {month}
            </span>
          </div>
        );
      })}
    </div>
  );
}
