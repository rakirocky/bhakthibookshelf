"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Spinner from "@/app/components/ui/Spinner";
import { useCart } from "@/app/hooks/useCart";
import { openRazorpayCheckout } from "@/app/lib/razorpayClient";
import { useT } from "@/app/lib/i18n/I18nProvider";

export default function CheckoutForm() {
  const { t } = useT();
  const router = useRouter();

  const {
    items,
    total,
    clearCart,
  } = useCart();

  const [loading, setLoading] =
    useState(false);

  // If a customer opens the payment widget and then cancels/closes it,
  // we must NOT let them just re-submit the form — that would create a
  // second, duplicate order. Instead, once an order exists, we keep its
  // details here and offer a "Retry Payment" action that reopens
  // payment for the SAME order rather than creating a new one.
  const [pendingPayment, setPendingPayment] = useState<{
    orderId: number;
    orderNumber: string;
    razorpayOrderId: string;
    razorpayKeyId: string;
    amount: number;
    currency: string;
    prefill: {
      name: string;
      email: string;
      contact: string;
    };
  } | null>(null);

  const [paymentError, setPaymentError] = useState("");

  async function verifyAndFinish(
    orderId: number,
    orderNumber: string,
    result: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }
  ) {
    const response = await fetch(
      "/api/orders/verify-payment",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          orderId,
          ...result,
        }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      setPaymentError(
        data.message ??
          t("checkout.verifyFailed")
      );
      return;
    }

    clearCart();

    router.push(`/order-success?order=${orderNumber}`);
  }

  async function openPaymentFor(order: {
    orderId: number;
    orderNumber: string;
    razorpayOrderId: string;
    razorpayKeyId: string;
    amount: number;
    currency: string;
    prefill: { name: string; email: string; contact: string };
  }) {
    setPaymentError("");

    try {
      const result = await openRazorpayCheckout({
        keyId: order.razorpayKeyId,
        razorpayOrderId: order.razorpayOrderId,
        amount: order.amount,
        currency: order.currency,
        name: "Bhakthi Bookshelf",
        description: `Order ${order.orderNumber}`,
        prefill: order.prefill,
      });

      if (!result) {
        // Customer closed the widget without paying — not an error,
        // just leave them able to retry against the same order.
        return;
      }

      await verifyAndFinish(
        order.orderId,
        order.orderNumber,
        result
      );
    } catch (err) {
      setPaymentError(
        err instanceof Error
          ? err.message
          : t("checkout.payFailed")
      );
    }
  }

  async function submit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const form =
      new FormData(e.currentTarget);

    const customerName = String(
      form.get("customer_name") ?? ""
    );
    const email = String(form.get("email") ?? "");
    const mobile = String(form.get("mobile") ?? "");

    const payload = {
      customer_name: customerName,

      email,

      mobile,

      address: form.get("address"),

      city: form.get("city"),

      state: form.get("state"),

      pincode: form.get("pincode"),

      country:
        form.get("country"),

      gst_number:
        form.get("gst_number"),

      total_amount: total,

      items: items.map((x) => ({
        book_id: x.id,
        quantity: x.quantity,
        price: x.price,
      })),
    };

    setLoading(true);
    setPaymentError("");

    try {
      const response =
        await fetch("/api/orders", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        });

      const data =
        await response.json();

      if (response.status === 401) {
        // Stale/superseded login — send them to sign in before any
        // payment starts; the login page brings them back here.
        router.push("/account/login?from=/checkout");
        return;
      }

      if (!data.success) {
        alert(data.message);
        return;
      }

      // Razorpay not configured yet — same behavior as before this
      // integration existed, order just sits PENDING for manual
      // admin confirmation.
      if (!data.razorpayOrderId) {
        clearCart();

        router.push(
          `/order-success?order=${data.orderNumber}`
        );
        return;
      }

      const orderDetails = {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        razorpayOrderId: data.razorpayOrderId,
        razorpayKeyId: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        prefill: {
          name: customerName,
          email,
          contact: mobile,
        },
      };

      setPendingPayment(orderDetails);

      await openPaymentFor(orderDetails);
    } catch (err) {
      console.error(err);

      alert(
        t("checkout.placeFailed")
      );
    } finally {
      setLoading(false);
    }
  }

  if (pendingPayment) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "20px 0",
        }}
      >
        <p style={{ marginBottom: 8 }}>
          {t("checkout.saved", { order: pendingPayment.orderNumber })}
        </p>

        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          {t("checkout.retryNote")}
        </p>

        {paymentError && (
          <p
            style={{
              color: "var(--color-danger-text)",
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            {paymentError}
          </p>
        )}

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openPaymentFor(pendingPayment)}
        >
          {t("checkout.retry")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="checkout-form"
      style={{
        display: "grid",
        gap: 20,
      }}
    >
      <div>

        <label>
          {t("checkout.fullName")}
        </label>

        <input
          name="customer_name"
          required
        />

      </div>

      <div>

        <label>
          {t("signup.email")}
        </label>

        <input
          name="email"
          type="email"
          required
        />

      </div>

      <div>

        <label>
          {t("checkout.mobile")}
        </label>

        <input
          name="mobile"
          required
        />

      </div>

      <div>

        <label>
          {t("checkout.address")}
        </label>

        <textarea
          name="address"
          rows={4}
          required
        />

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 20,
        }}
      >
        <input
          name="city"
          placeholder={t("checkout.city")}
          required
        />

        <input
          name="state"
          placeholder={t("checkout.state")}
          required
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 20,
        }}
      >
        <input
          name="pincode"
          placeholder={t("checkout.pincode")}
          required
        />

        <input
          name="country"
          defaultValue="India"
        />
      </div>

      <div>

        <label>
          {t("checkout.gst")}
        </label>

        <input
          name="gst_number"
        />

      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-block"
      >
        {loading && <Spinner />}
        {loading
          ? t("checkout.creating")
          : t("checkout.place")}
      </button>

    </form>
  );
}
