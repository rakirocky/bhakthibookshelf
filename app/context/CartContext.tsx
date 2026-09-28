"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";

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
  /** Titles just dropped because the book was deleted/unpublished. */
  removedTitles: string[];
  dismissRemoved: () => void;
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
  const [hydrated, setHydrated] = useState(false);
  const [removedTitles, setRemovedTitles] = useState<string[]>([]);
  const pathname = usePathname();
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

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
    setHydrated(true);
  }, []);

  // The cart is only in this browser, so the admin can delete or
  // unpublish a book that's sitting in it. Re-check with the server on
  // first load and whenever the cart or checkout opens: drop books that
  // can no longer be bought (and say which), and refresh prices.
  const checkOnPage = pathname === "/cart" || pathname === "/checkout";
  useEffect(() => {
    if (!hydrated) return;
    const ids = items.map((x) => x.id);
    if (ids.length === 0) return;

    let cancelled = false;
    fetch("/api/books/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { books: { id: number; price: number }[] | null } | null) => {
        if (cancelled || !data?.books) return;
        // ids can arrive as strings (Postgres bigint) — compare as numbers
        const live = new Map(data.books.map((b) => [Number(b.id), Number(b.price)]));
        const gone = itemsRef.current.filter((x) => !live.has(x.id));
        if (gone.length > 0) {
          setRemovedTitles((t) => [
            ...new Set([...t, ...gone.map((x) => x.title)]),
          ]);
        }
        setItems((prev) => {
          const next = prev
            .filter((x) => live.has(x.id))
            .map((x) => ({ ...x, price: live.get(x.id)! }));
          const changed =
            next.length !== prev.length ||
            next.some((x, i) => x.price !== prev[i].price);
          return changed ? next : prev;
        });
      })
      .catch(() => {
        /* offline — the server re-checks at checkout anyway */
      });

    return () => {
      cancelled = true;
    };
    // items deliberately omitted: re-check on load and on opening the
    // cart/checkout, not on every add/remove.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, checkOnPage]);

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
        removedTitles,
        dismissRemoved: () => setRemovedTitles([]),
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
