import Link from "next/link";

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
}

export default function QuickActionCard({
  title,
  description,
  href,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
      }}
    >
      <div
        style={{
          background: "var(--color-white)",
          borderRadius: 12,
          border: "1px solid var(--color-border)",
          padding: 24,
          transition: "0.2s",
          height: "100%",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            color: "var(--color-primary)",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
            marginBottom: 0,
          }}
        >
          {description}
        </p>
      </div>
    </Link>
  );
}
