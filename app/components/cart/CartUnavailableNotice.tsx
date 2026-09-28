"use client";

import { useCart } from "@/app/hooks/useCart";
import { useT } from "@/app/lib/i18n/I18nProvider";

/** Tells the visitor which cart books were removed because they are no
 *  longer available (deleted or unpublished by the admin). */
export default function CartUnavailableNotice() {
  const { removedTitles, dismissRemoved } = useCart();
  const { t } = useT();

  if (removedTitles.length === 0) return null;

  const list = removedTitles.map((x) => `“${x}”`).join(", ");

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        justifyContent: "space-between",
        background: "#fff7ed",
        border: "1px solid #fdba74",
        color: "#7c2d12",
        borderRadius: 10,
        padding: "12px 16px",
        margin: "0 0 24px",
        fontSize: 15,
        lineHeight: 1.5,
      }}
    >
      <span>
        {removedTitles.length === 1
          ? t("cart.unavailableOne", { title: list })
          : t("cart.unavailableMany", { titles: list })}
      </span>
      <button
        type="button"
        onClick={dismissRemoved}
        aria-label={t("cart.dismiss")}
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          fontSize: 20,
          lineHeight: 1,
          cursor: "pointer",
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
