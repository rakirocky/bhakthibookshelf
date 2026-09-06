"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Spinner from "@/app/components/ui/Spinner";
import { useCart } from "@/app/hooks/useCart";
import { openRazorpayCheckout } from "@/app/lib/razorpayClient";

export default function CheckoutForm() {
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
          "Payment verification failed. If money was deducted, contact support with your order number."
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
          : "Payment failed. Please try again."
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
        "Unable to place order."
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
          Order <strong>{pendingPayment.orderNumber}</strong>{" "}
          is saved and waiting for payment.
        </p>

        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          If the payment window closed before you finished,
          no charge was made — click below to try again.
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
          Retry Payment
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{
        display: "grid",
        gap: 20,
      }}
    >
      <div>

        <label>
          Full Name
        </label>

        <input
          name="customer_name"
          required
        />

      </div>

      <div>

        <label>
          Email
        </label>

        <input
          name="email"
          type="email"
          required
        />

      </div>

      <div>

        <label>
          Mobile
        </label>

        <input
          name="mobile"
          required
        />

      </div>

      <div>

        <label>
          Address
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
          placeholder="City"
          required
        />

        <input
          name="state"
          placeholder="State"
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
          placeholder="Pincode"
          required
        />

        <input
          name="country"
          defaultValue="India"
        />
      </div>

      <div>

        <label>
          GST Number
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
          ? "Creating Order..."
          : "Place Order"}
      </button>

    </form>
  );
}
