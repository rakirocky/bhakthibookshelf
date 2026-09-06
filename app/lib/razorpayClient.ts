// Loads Razorpay's checkout script once, reuses it on subsequent calls
// rather than injecting a duplicate <script> tag every time someone
// checks out.
let scriptLoadPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window !== "undefined" && (window as any).Razorpay) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Razorpay checkout script."));
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Opens the Razorpay payment widget and resolves with the payment
 * details once the customer completes payment. Resolves to `null` if
 * the customer closes the widget without paying — that's a normal,
 * expected outcome, not an error, and callers should treat it as "they
 * changed their mind," not "something broke."
 */
export function openRazorpayCheckout(options: {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}): Promise<RazorpayPaymentResult | null> {
  return loadRazorpayScript().then(() => {
    return new Promise((resolve, reject) => {
      const razorpay = new (window as any).Razorpay({
        key: options.keyId,
        order_id: options.razorpayOrderId,
        amount: options.amount,
        currency: options.currency,
        name: options.name,
        description: options.description,
        prefill: options.prefill,
        theme: {
          color: "#d97706",
        },
        handler: function (response: RazorpayPaymentResult) {
          resolve(response);
        },
        modal: {
          ondismiss: function () {
            resolve(null);
          },
        },
      });

      razorpay.on(
        "payment.failed",
        function (response: any) {
          reject(
            new Error(
              response?.error?.description ||
                "Payment failed. Please try again."
            )
          );
        }
      );

      razorpay.open();
    });
  });
}
