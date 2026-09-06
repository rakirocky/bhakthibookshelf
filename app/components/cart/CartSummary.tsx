"use client";

import Link from "next/link";

import { useCart } from "@/app/hooks/useCart";

export default function CartSummary() {
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
      <h2>Order Summary</h2>

      <hr />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 15,
        }}
      >
        <span>Subtotal</span>
        <strong>₹{total}</strong>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <span>GST</span>
        <span>₹0</span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <span>Delivery</span>
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
        <span>Total</span>
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
        Clear Cart
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
        Proceed to Checkout
      </Link>

      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "var(--color-text-muted)",
          marginTop: 10,
        }}
      >
        You'll need to sign in or create an account to complete your
        order.
      </p>
    </aside>
  );
}
