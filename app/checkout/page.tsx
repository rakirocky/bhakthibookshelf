"use client";

import Container from "../components/ui/Container";
import CheckoutForm from "../components/checkout/CheckoutForm";
import CheckoutSummary from "../components/checkout/CheckoutSummary";

import { useCart } from "../hooks/useCart";
import EmptyCart from "../components/cart/EmptyCart";
import { useIsNativeApp } from "../lib/offline/useNative";
import PurchaseOnWebNotice from "../components/native/PurchaseOnWebNotice";

export default function CheckoutPage() {
  const { items } = useCart();
  const native = useIsNativeApp();

  if (native) {
    return (
      <Container>
        <PurchaseOnWebNotice message="Checkout isn't available in the app. Please visit bhakthibookshelf.in in your browser to complete your purchase." />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container>
        <EmptyCart />
      </Container>
    );
  }

  return (
    <Container>
      <h1
        style={{
          marginBottom: 40,
        }}
      >
        Checkout
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 40,
        }}
      >
        <CheckoutForm />

        <CheckoutSummary />
      </div>
    </Container>
  );
}
