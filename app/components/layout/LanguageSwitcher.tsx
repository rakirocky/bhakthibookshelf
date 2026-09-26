"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LANGUAGE_COOKIE = "site_language";

function readCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return match ? match.split("=")[1] : null;
}

export default function LanguageSwitcher() {
  const router = useRouter();

  const [language, setLanguage] = useState("all");

  useEffect(() => {
    // The language cookie is read server-side for the initial render;
    // this only re-syncs the control after mount (e.g. changed in another
    // tab). Reading document.cookie during render would break hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguage(readCookie(LANGUAGE_COOKIE) ?? "all");
  }, []);

  function selectLanguage(value: string) {
    setLanguage(value);

    // 1 year, non-httpOnly — this is just a display preference, not
    // sensitive, and needs to be settable from client JS. (Assigning
    // document.cookie is a browser side effect, not a mutation of
    // module state — the immutability lint misfires here.)
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `${LANGUAGE_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;

    router.refresh();
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 13,
        border: "1px solid var(--color-border-strong)",
        borderRadius: 20,
        padding: 3,
      }}
    >
      {[
        { value: "all", label: "All" },
        { value: "English", label: "EN" },
        { value: "Kannada", label: "ಕನ್ನಡ" },
      ].map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => selectLanguage(option.value)}
          style={{
            border: "none",
            borderRadius: 16,
            padding: "5px 12px",
            fontWeight: 600,
            cursor: "pointer",
            background:
              language === option.value
                ? "var(--color-primary-strong)"
                : "transparent",
            color:
              language === option.value
                ? "var(--color-white)"
                : "var(--color-text-strong)",
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
