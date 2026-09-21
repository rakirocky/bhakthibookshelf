import { CheckCircle2 } from "lucide-react";

interface FeatureItemProps {
  text: string;
}

export default function FeatureItem({
  text,
}: FeatureItemProps) {
  return (
    <div className="feature-item">
      <span className="feature-icon">
        <CheckCircle2 />
      </span>

      <span>{text}</span>
    </div>
  );
}
