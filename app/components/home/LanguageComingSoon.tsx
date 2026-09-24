import Link from "next/link";

// Shown where the slider / featured grid would be when the chosen
// language (navbar All / EN / ಕನ್ನಡ) has no published books yet.
export default function LanguageComingSoon({
  language,
  compact = false,
}: {
  language: string;
  compact?: boolean;
}) {
  const kannada = language.toLowerCase() === "kannada";

  return (
    <div
      style={{
        textAlign: "center",
        padding: compact ? "24px 16px" : "48px 24px",
        margin: "0 auto",
        maxWidth: 420,
        borderRadius: 16,
        border: "1px dashed rgba(217, 119, 6, 0.5)",
        background: "rgba(255, 251, 241, 0.85)",
      }}
    >
      <div style={{ fontSize: compact ? 28 : 40, marginBottom: 8 }}>🪔</div>
      <p
        lang={kannada ? "kn" : undefined}
        style={{ margin: "0 0 6px", fontWeight: 700, color: "#7c2d12" }}
      >
        {kannada
          ? "ಕನ್ನಡ ಪುಸ್ತಕಗಳು ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿವೆ"
          : `${language} books are coming soon`}
      </p>
      <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-secondary)" }}>
        {kannada ? "Kannada books are coming soon. " : ""}
        <Link href="/books" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
          Browse the library
        </Link>
      </p>
    </div>
  );
}
