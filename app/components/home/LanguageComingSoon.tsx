import Link from "next/link";

import { getT } from "../../lib/i18n/server";

// Shown where the slider / featured grid would be when the chosen
// language (navbar All / EN / ಕನ್ನಡ) has no published books yet.
export default async function LanguageComingSoon({
  language,
  compact = false,
}: {
  language: string;
  compact?: boolean;
}) {
  const t = await getT();
  const kannada = language.toLowerCase() === "kannada";
  const langName = kannada ? t("lang.Kannada") : language === "English" ? t("lang.English") : language;

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
      <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#7c2d12" }}>
        {t("soon.title", { lang: langName })}
      </p>
      <p style={{ margin: 0, fontSize: 14 }}>
        <Link href="/books" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
          {t("soon.browse")}
        </Link>
      </p>
    </div>
  );
}
