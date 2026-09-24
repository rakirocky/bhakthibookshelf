"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Container from "../components/ui/Container";
import CheckoutForm from "../components/checkout/CheckoutForm";
import CheckoutSummary from "../components/checkout/CheckoutSummary";

import { useCart } from "../hooks/useCart";
import EmptyCart from "../components/cart/EmptyCart";
import { useIsNativeApp } from "../lib/offline/useNative";
import { isNativeApp } from "../lib/offline/native";
import PurchaseOnWebNotice from "../components/native/PurchaseOnWebNotice";

export default function CheckoutClient({
  signedIn,
}: {
  signedIn: boolean;
}) {
  const { items } = useCart();
  const native = useIsNativeApp();
  const router = useRouter();

  // A stale/superseded login still passes proxy.ts, so without this the
  // customer fills in the whole form and is only bounced at "Pay".
  // isNativeApp() is read directly: the hook's first (hydration) value
  // is always false, which would bounce the app's "buy on web" notice.
  useEffect(() => {
    if (!signedIn && !isNativeApp()) {
      router.replace("/account/login?from=/checkout");
    }
  }, [signedIn, router]);

  if (native) {
    return (
      <Container>
        <PurchaseOnWebNotice message="Checkout isn't available in the app. Please visit bhakthibookshelf.in in your browser to complete your purchase." />
      </Container>
    );
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
