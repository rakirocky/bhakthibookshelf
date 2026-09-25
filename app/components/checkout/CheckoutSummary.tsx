"use client";

import { useCart } from "@/app/hooks/useCart";
import { useT } from "@/app/lib/i18n/I18nProvider";

export default function CheckoutSummary() {
  const { t } = useT();
  const {
    items,
    total,
  } = useCart();

  return (
    <aside
      style={{
        border: "1px solid var(--color-border-strong)",
        padding: 25,
        borderRadius: 12,
        alignSelf: "start",
      }}
    >
      <h2>{t("cart.summary")}</h2>

      <hr />

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "12px 0",
          }}
        >
          <span>{item.title}</span>

          <strong>
            ₹
            {item.price *
              item.quantity}
          </strong>
        </div>
      ))}

      <hr />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
          fontWeight: "bold",
        }}
      >
        <span>{t("cart.total")}</span>

        <span>₹{total}</span>
      </div>
    </aside>
  );
}
