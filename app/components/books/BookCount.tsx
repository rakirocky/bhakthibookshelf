"use client";

import { useT } from "@/app/lib/i18n/I18nProvider";

type Props = {
  count: number;
};

export default function BookCount({ count }: Props) {
  const { t } = useT();
  return (
    <div className="book-count">
      <p>{count === 1 ? t("library.countOne") : t("library.count", { n: count })}</p>
    </div>
  );
}
