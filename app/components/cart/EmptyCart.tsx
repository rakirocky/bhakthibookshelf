"use client";

import Link from "next/link";
import { useT } from "@/app/lib/i18n/I18nProvider";

export default function EmptyCart() {
  const { t } = useT();
  return (
    <div
      className="empty-cart"
      style={{
        textAlign: "center",
        padding: "80px 20px",
      }}
    >
      <h1>{t("cart.yourCart")}</h1>

      <p>{t("cart.empty")}</p>

      <Link
        href="/books"
        className="book-button"
      >
        {t("cart.browse")}
      </Link>
    </div>
  );
}
