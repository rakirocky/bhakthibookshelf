"use client";

import { useEffect } from "react";

import { track } from "@/app/lib/analytics/track";

/** GA4 "purchase" on the order-success page — once per order, even on reload. */
export default function TrackPurchase({
  orderNumber,
  value,
  books,
}: {
  orderNumber: string;
  value: number;
  books: { slug: string; title: string }[];
}) {
  useEffect(() => {
    const key = `ga_purchase_${orderNumber}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      /* storage blocked — may double count on reload, acceptable */
    }
    track("purchase", {
      transaction_id: orderNumber,
      currency: "INR",
      value,
      items: books.map((b) => ({ item_id: b.slug, item_name: b.title })),
    });
  }, [orderNumber, value, books]);

  return null;
}
