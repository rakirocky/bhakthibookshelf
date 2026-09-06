interface StatCardProps {
  icon: string;
  number: string;
  label: string;
}

export default function StatCard({
  icon,
  number,
  label,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <h2>{number}</h2>

      <p>{label}</p>
    </div>
  );
}
