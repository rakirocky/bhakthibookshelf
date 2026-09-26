"use client";

import { useWishlist } from "@/app/context/WishlistContext";
import { useToast } from "@/app/context/ToastContext";
import { useT } from "@/app/lib/i18n/I18nProvider";
import { track } from "@/app/lib/analytics/track";

/**
 * ♡ save-for-later toggle. "icon" sits on a book card's cover; "full" is
 * the labelled button on the book page. Web only — the read-only app
 * has no buying, so nothing to save for later.
 */
export default function WishlistButton({
  slug,
  variant = "icon",
}: {
  slug: string;
  variant?: "icon" | "full";
}) {
  const { t } = useT();
  const { has, toggle } = useWishlist();
  const { showToast } = useToast();
  const saved = has(slug);
  const label = saved ? t("wishlist.remove") : t("wishlist.add");

  function handleClick() {
    const nowSaved = toggle(slug);
    if (nowSaved) track("add_to_wishlist", { items: [{ item_id: slug }] });
    showToast(nowSaved ? t("wishlist.added") : t("wishlist.removed"));
  }

  return (
    <button
      type="button"
      data-web-only
      className={`wishlist-btn wishlist-btn--${variant}${saved ? " is-saved" : ""}`}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      onClick={handleClick}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 6.9 4.5c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.5 0 5.5 3.5 4.2 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
      </svg>
      {variant === "full" && <span>{saved ? t("wishlist.saved") : t("wishlist.add")}</span>}
    </button>
  );
}
