// Invoice numbers come from one database sequence shared by orders and
// subscriptions (migration 036); the prefix only says which kind it is
// and the date is the invoice date in IST, e.g. BB-EB-20261014-0021
// (owner 2026-10-14: dated like the order number).
export function formatInvoiceNumber(
  kind: "EB" | "LT",
  invoiceNo: number | string | null | undefined,
  invoicedAt: string | Date | null | undefined
) {
  if (invoiceNo == null) return null;
  const ymd = invoicedAt
    ? new Date(invoicedAt)
        .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
        .replaceAll("-", "")
    : "";
  return `BB-${kind}-${ymd ? `${ymd}-` : ""}${String(invoiceNo).padStart(4, "0")}`;
}
