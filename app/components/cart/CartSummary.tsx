"use client";

import Link from "next/link";

import { useCart } from "@/app/hooks/useCart";
import { useT } from "@/app/lib/i18n/I18nProvider";

export default function CartSummary() {
  const { t } = useT();
  const {
    total,
    clearCart,
  } = useCart();

  return (
    <aside
      className="cart-summary"
      style={{
        border: "1px solid var(--color-border-strong)",
        borderRadius: 8,
        padding: 24,
        position: "sticky",
        top: 20,
      }}
    >
      <h2>{t("cart.summary")}</h2>

      <hr />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 15,
        }}
      >
        <span>{t("cart.subtotal")}</span>
        <strong>₹{total}</strong>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <span>{t("cart.gst")}</span>
        <span>₹0</span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <span>{t("cart.delivery")}</span>
        <span>₹0</span>
      </div>

      <hr />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
          fontWeight: "bold",
          marginTop: 20,
        }}
      >
        <span>{t("cart.total")}</span>
        <span>₹{total}</span>
      </div>

      <button
        type="button"
        onClick={clearCart}
        className="btn btn-outline btn-block"
        style={{
          marginTop: 20,
        }}
      >
        {t("cart.clear")}
      </button>

      <Link
        href="/checkout"
        className="book-button"
        style={{
          display: "block",
          textAlign: "center",
          marginTop: 20,
        }}
      >
        {t("cart.proceed")}
      </Link>

      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "var(--color-text-muted)",
          marginTop: 10,
        }}
      >
        {t("cart.signInNote")}
      </p>
    </aside>
  );
}
