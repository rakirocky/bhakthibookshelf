"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

import { gaItem, track } from "../lib/analytics/track";

export type CartItem = {
  id: number;
  slug: string;
  title: string;
  author: string;
  price: number;
  cover?: string | null;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  total: number;
};

const CartContext = createContext<CartContextType | null>(
  null
);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Hydrate from localStorage *after* mount, not in a lazy useState
    // initializer: the server renders with an empty cart, so reading
    // storage during the first client render would desync hydration for
    // every cart-count consumer. Starting empty and filling in an effect
    // is the correct SSR pattern here.
    const saved = localStorage.getItem("cart");

    if (saved) {
      try {
        const parsed: CartItem[] = JSON.parse(saved);
        // Carts saved before ebooks were capped at one copy may hold
        // quantity > 1 — normalize so the shown total matches the charge.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(parsed.map((x) => ({ ...x, quantity: 1 })));
      } catch {
        /* corrupt cart JSON — ignore, start empty */
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify(items)
    );
  }, [items]);

  function addItem(item: Omit<CartItem, "quantity">) {
    if (!items.some((x) => x.id === item.id)) {
      track("add_to_cart", { currency: "INR", value: item.price, items: [gaItem(item)] });
    }

    setItems((prev) => {
      const existing = prev.find(
        (x) => x.id === item.id
      );

      // Ebooks are one copy each — adding again is a no-op.
      if (existing) {
        return prev;
      }

      return [
        ...prev,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  }

  function removeItem(id: number) {
    setItems((prev) =>
      prev.filter((x) => x.id !== id)
    );
  }

  function updateQuantity(
    id: number,
    quantity: number
  ) {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              quantity,
            }
          : x
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const cartCount = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    [items]
  );

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      ),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCartContext must be used inside CartProvider"
    );
  }

  return context;
}
