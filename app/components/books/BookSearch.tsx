"use client";

import { useT } from "@/app/lib/i18n/I18nProvider";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function BookSearch({
  value,
  onChange,
}: Props) {
  const { t } = useT();
  return (
    <div className="book-search">
      <input
        type="search"
        placeholder={t("search.placeholder")}
        aria-label={t("search.open")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="book-search__clear"
          aria-label={t("search.clear")}
          onClick={() => onChange("")}
        >
          ✕
        </button>
      )}
    </div>
  );
}
