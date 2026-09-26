"use client";

import { ReactNode } from "react";

import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}
