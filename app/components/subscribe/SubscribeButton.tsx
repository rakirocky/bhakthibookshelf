"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Spinner from "@/app/components/ui/Spinner";
import { useToast } from "@/app/context/ToastContext";
import { openRazorpayCheckout } from "@/app/lib/razorpayClient";
import { useIsReadOnlyApp } from "@/app/lib/offline/appMode";
import { useT } from "@/app/lib/i18n/I18nProvider";

export default function SubscribeButton({
  planId,
}: {
  planId: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const readOnlyApp = useIsReadOnlyApp();

  const [loading, setLoading] = useState(false);
  const { t } = useT();

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
        data.message ?? t("sub.verifyFailed"),
        "error"
      );
      return;
    }

    showToast(t("sub.activated"));

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
        description: "Lifetime Subscription",
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
          : t("checkout.payFailed"),
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
          data.message ?? t("news.error")
        );
      }

      // Razorpay not configured yet — same behavior as before this
      // integration existed.
      if (!data.razorpayOrderId) {
        showToast(
          t("sub.submitted")
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
          : t("news.error"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  if (readOnlyApp) {
    return null;
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
          {t("sub.saved")}
        </p>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => openPaymentFor(pendingPayment)}
        >
          {t("checkout.retry")}
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
      {loading ? t("sub.submitting") : t("sub.now")}
    </button>
  );
}
