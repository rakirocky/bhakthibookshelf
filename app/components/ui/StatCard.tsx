import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  number: string;
  label: string;
  /** Hidden in the read-only app (purchase/payment claims). */
  webOnly?: boolean;
}

export default function StatCard({
  icon,
  number,
  label,
  webOnly,
}: StatCardProps) {
  return (
    <div
      className="stat-card"
      data-web-only={webOnly || undefined}
    >
      <div className="stat-icon">{icon}</div>

      <h2>{number}</h2>

      <p>{label}</p>
    </div>
  );
}
