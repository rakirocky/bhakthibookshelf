import Link from "next/link";

// Only rendered when the URL has ?theme= (design comparison), so normal
// visitors never see it.
const OPTIONS = [
  { value: "current", label: "Current" },
  { value: "manuscript", label: "A · Temple Manuscript" },
  { value: "aarti", label: "B · Night Aarti" },
];

export default function ThemePreviewBar({ current }: { current: string }) {
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 84,
        transform: "translateX(-50%)",
        zIndex: 2000,
        display: "flex",
        gap: 6,
        padding: 6,
        borderRadius: 999,
        background: "rgba(20, 16, 40, 0.88)",
        boxShadow: "0 10px 30px rgba(0,0,0,.35)",
        fontSize: 13,
        whiteSpace: "nowrap",
      }}
    >
      {OPTIONS.map((o) => (
        <Link
          key={o.value}
          href={`/?theme=${o.value}`}
          style={{
            padding: "7px 12px",
            borderRadius: 999,
            fontWeight: 600,
            color: current === o.value ? "#1c1433" : "#fde68a",
            background: current === o.value ? "#fbbf24" : "transparent",
            textDecoration: "none",
          }}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
