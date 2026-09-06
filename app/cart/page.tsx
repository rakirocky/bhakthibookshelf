"use client";

import Container from "../components/ui/Container";

import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import EmptyCart from "../components/cart/EmptyCart";

import { useCart } from "../hooks/useCart";

export default function CartPage() {
  const { items } =
    useCart();

  if (items.length === 0) {
    return (
      <Container>
        <EmptyCart />
      </Container>
    );
  }

  return (
    <main>

      <Container>

        <h1
          style={{
            marginBottom: 40,
          }}
        >
          Shopping Cart
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 40,
          }}
        >
          <div>

            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
              />
            ))}

          </div>

          <CartSummary />

        </div>

      </Container>

    </main>
  );
}
