"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

const STORAGE_KEY = "wishlist";
const API = "/api/customer/wishlist";

type WishlistContextType = {
  /** saved book slugs, newest first */
  slugs: string[];
  has: (slug: string) => boolean;
  /** adds or removes; returns true if the book is now saved */
  toggle: (slug: string) => boolean;
  remove: (slug: string) => void;
  count: number;
  /** false until the first load finishes (avoids a flash of "empty") */
  ready: boolean;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

function readLocal(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeLocal(slugs: string[]) {
  try {
    if (slugs.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    /* storage blocked — the list just won't survive a reload */
  }
}

/**
 * Wishlist ("♡ save for later").
 *
 * Guests: kept in this browser (localStorage). Logged in: kept on the
 * account (/api/customer/wishlist) so it follows them to other devices —
 * on the first load after login any guest list is merged into the
 * account and the local copy is cleared, so the next person to use a
 * shared browser doesn't inherit it.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const local = readLocal();
    // Hydrate after mount (same SSR reasoning as CartContext).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlugs(local);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API, local.length ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slugs: local }),
        } : undefined);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setSlugs(data.slugs ?? []);
          setLoggedIn(true);
          writeLocal([]);
        }
      } catch {
        /* offline — keep the local list */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const sync = useCallback(
    async (method: "POST" | "DELETE", slug: string) => {
      if (!loggedIn) return;
      try {
        const res = await fetch(API, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(method === "POST" ? { slugs: [slug] } : { slug }),
        });
        if (res.ok) setSlugs((await res.json()).slugs ?? []);
      } catch {
        /* keep the optimistic state; the next page load re-reads the account */
      }
    },
    [loggedIn]
  );

  const update = useCallback(
    (next: string[]) => {
      setSlugs(next);
      if (!loggedIn) writeLocal(next);
    },
    [loggedIn]
  );

  const remove = useCallback(
    (slug: string) => {
      update(slugs.filter((s) => s !== slug));
      void sync("DELETE", slug);
    },
    [slugs, update, sync]
  );

  const toggle = useCallback(
    (slug: string) => {
      if (slugs.includes(slug)) {
        remove(slug);
        return false;
      }
      update([slug, ...slugs]);
      void sync("POST", slug);
      return true;
    },
    [slugs, update, sync, remove]
  );

  const value = useMemo(
    () => ({
      slugs,
      has: (slug: string) => slugs.includes(slug),
      toggle,
      remove,
      count: slugs.length,
      ready,
    }),
    [slugs, toggle, remove, ready]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
