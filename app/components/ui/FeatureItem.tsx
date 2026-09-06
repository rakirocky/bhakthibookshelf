interface FeatureItemProps {
  text: string;
}

export default function FeatureItem({
  text,
}: FeatureItemProps) {
  return (
    <div className="feature-item">
      <span className="feature-icon">✔</span>

      <span>{text}</span>
    </div>
  );
}
