import Link from "next/link";

export default function EmptyCart() {
  return (
    <div
      className="empty-cart"
      style={{
        textAlign: "center",
        padding: "80px 20px",
      }}
    >
      <h1>Your Shopping Cart</h1>

      <p>Your cart is currently empty.</p>

      <Link
        href="/books"
        className="book-button"
      >
        Browse Books
      </Link>
    </div>
  );
}
