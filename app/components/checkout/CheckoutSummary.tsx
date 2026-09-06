"use client";

import { useCart } from "@/app/hooks/useCart";

export default function CheckoutSummary() {
  const {
    items,
    total,
  } = useCart();

  return (
    <aside
      style={{
        border: "1px solid var(--color-border-strong)",
        padding: 25,
        borderRadius: 8,
      }}
    >
      <h2>Order Summary</h2>

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
          <span>
            {item.title}

            × {item.quantity}
          </span>

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
        <span>Total</span>

        <span>₹{total}</span>
      </div>

      <button
        type="submit"
        style={{
          width: "100%",
          marginTop: 25,
          padding: 14,
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        Place Order
      </button>
    </aside>
  );
}
