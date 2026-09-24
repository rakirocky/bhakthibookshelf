"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Container from "../components/ui/Container";
import CheckoutForm from "../components/checkout/CheckoutForm";
import CheckoutSummary from "../components/checkout/CheckoutSummary";

import { useCart } from "../hooks/useCart";
import EmptyCart from "../components/cart/EmptyCart";
import { useIsReadOnlyApp, isReadOnlyApp } from "../lib/offline/appMode";

export default function CheckoutClient({
  signedIn,
}: {
  signedIn: boolean;
}) {
  const { items } = useCart();
  const readOnlyApp = useIsReadOnlyApp();
  const router = useRouter();

  // A stale/superseded login still passes proxy.ts, so without this the
  // customer fills in the whole form and is only bounced at "Pay".
  // isReadOnlyApp() is read directly: the hook's first (hydration) value
  // is always false; the read-only app's own guard handles /checkout.
  useEffect(() => {
    if (!signedIn && !isReadOnlyApp()) {
      router.replace("/account/login?from=/checkout");
    }
  }, [signedIn, router]);

  if (readOnlyApp) {
    return null;
  }

  if (!signedIn) {
    return null;
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
