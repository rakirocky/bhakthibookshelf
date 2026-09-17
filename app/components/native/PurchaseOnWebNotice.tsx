type Props = {
  message?: string;
};

/**
 * Shown in place of Buy/Subscribe/Checkout inside the Capacitor app.
 * The app deliberately never sells digital goods itself (Play Billing
 * policy scope) — purchases only happen on the website.
 */
export default function PurchaseOnWebNotice({
  message = "Purchases aren't available in the app. Please visit bhakthibookshelf.in in your browser to buy this book.",
}: Props) {
  return (
    <p
      style={{
        background: "var(--color-warning-bg)",
        color: "var(--color-warning-text)",
        padding: "14px 18px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        textAlign: "center",
      }}
    >
      {message}
    </p>
  );
}
