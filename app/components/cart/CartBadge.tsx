"use client";

import Link from "next/link";

import { useCart } from "@/app/hooks/useCart";

export default function CartBadge() {
  const {
    cartCount,
  } = useCart();

  return (
    <Link
      href="/cart"
      style={{
        textDecoration: "none",
        fontWeight: 700,
      }}
    >
      🛒 {cartCount}
    </Link>
  );
}
