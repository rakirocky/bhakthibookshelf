/**
 * Sends a Google Analytics 4 event — a silent no-op when GA isn't set
 * up (no GA_MEASUREMENT_ID), still loading, or blocked by the browser.
 * Event names follow GA4's recommended ones (add_to_cart, purchase, …)
 * so they show up in GA's built-in e-commerce reports.
 */
export function track(event: string, params?: Record<string, unknown>) {
  try {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === "function") gtag("event", event, params);
  } catch {
    /* analytics must never break the page */
  }
}

/** GA4 "items" entry for a book. */
export function gaItem(book: { slug: string; title: string; price?: number | null }) {
  return {
    item_id: book.slug,
    item_name: book.title,
    ...(book.price != null ? { price: Number(book.price) } : {}),
  };
}
