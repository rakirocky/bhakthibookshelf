"use client";

import { ReactNode } from "react";

import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ToastProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </ToastProvider>
  );
}
