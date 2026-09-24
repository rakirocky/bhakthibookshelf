import { CheckCircle2 } from "lucide-react";

interface FeatureItemProps {
  text: string;
  /** Hidden in the read-only app (purchase/payment claims). */
  webOnly?: boolean;
}

export default function FeatureItem({
  text,
  webOnly,
}: FeatureItemProps) {
  return (
    <div
      className="feature-item"
      data-web-only={webOnly || undefined}
    >
      <span className="feature-icon">
        <CheckCircle2 />
      </span>

      <span>{text}</span>
    </div>
  );
}
