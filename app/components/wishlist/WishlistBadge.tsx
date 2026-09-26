"use client";

import Link from "next/link";

import { useWishlist } from "@/app/context/WishlistContext";
import { useT } from "@/app/lib/i18n/I18nProvider";

/** Header ♡ link to /wishlist with the saved count, next to the cart. */
export default function WishlistBadge() {
  const { t } = useT();
  const { count } = useWishlist();

  return (
    <Link href="/wishlist" className="wishlist-badge" aria-label={t("wishlist.title")} title={t("wishlist.title")}>
      ♡ {count}
    </Link>
  );
}
