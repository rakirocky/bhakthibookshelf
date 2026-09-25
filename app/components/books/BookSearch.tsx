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
        type="text"
        placeholder={t("library.search")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
