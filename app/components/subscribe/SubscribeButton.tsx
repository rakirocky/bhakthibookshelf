"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Spinner from "@/app/components/ui/Spinner";
import { useToast } from "@/app/context/ToastContext";
import { openRazorpayCheckout } from "@/app/lib/razorpayClient";

export default function SubscribeButton({
  planId,
}: {
  planId: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  // Same reasoning as CheckoutForm — once a subscription + Razorpay
  // order exist, a cancelled payment must retry against the SAME
  // subscription, not create a second pending one.
  const [pendingPayment, setPendingPayment] = useState<{
    subscriptionId: number;
    razorpayOrderId: string;
    razorpayKeyId: string;
    amount: number;
    currency: string;
  } | null>(null);

  async function verifyPayment(
    subscriptionId: number,
    result: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }
  ) {
    const response = await fetch(
      "/api/customer/subscribe/verify-payment",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          subscriptionId,
          ...result,
        }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      showToast(
        data.message ?? "Payment verification failed.",
        "error"
      );
      return;
    }

    showToast("Subscription activated — welcome aboard!");

    setPendingPayment(null);
    router.refresh();
  }

  async function openPaymentFor(payment: {
    subscriptionId: number;
    razorpayOrderId: string;
    razorpayKeyId: string;
    amount: number;
    currency: string;
  }) {
    try {
      const result = await openRazorpayCheckout({
        keyId: payment.razorpayKeyId,
        razorpayOrderId: payment.razorpayOrderId,
        amount: payment.amount,
        currency: payment.currency,
        name: "Bhakthi Bookshelf",
        description: "Yearly Subscription",
      });

      if (!result) {
        // Closed without paying — leave pendingPayment in place so
        // Retry Payment is offered instead of a fresh Subscribe click.
        return;
      }

      await verifyPayment(payment.subscriptionId, result);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.",
        "error"
      );
    }
  }

  async function handleSubscribe() {
    setLoading(true);

    try {
      const response = await fetch(
        "/api/customer/subscribe",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ planId }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to subscribe."
        );
      }

      // Razorpay not configured yet — same behavior as before this
      // integration existed.
      if (!data.razorpayOrderId) {
        showToast(
          "Subscription request submitted — we'll confirm once payment is received."
        );
        router.refresh();
        return;
      }

      const payment = {
        subscriptionId: data.subscription.id,
        razorpayOrderId: data.razorpayOrderId,
        razorpayKeyId: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
      };

      setPendingPayment(payment);

      await openPaymentFor(payment);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to subscribe.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  if (pendingPayment) {
    return (
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-secondary)",
            marginBottom: 14,
          }}
        >
          Your subscription is saved and waiting for
          payment.
        </p>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => openPaymentFor(pendingPayment)}
        >
          Retry Payment
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSubscribe}
      disabled={loading}
      className="btn btn-primary btn-block"
    >
      {loading && <Spinner />}
      {loading ? "Submitting..." : "Subscribe Now"}
    </button>
  );
}
