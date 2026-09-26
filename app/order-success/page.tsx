import Link from "next/link";
import Container from "../components/ui/Container";
import { getCustomerSession } from "../lib/auth/getCustomerSession";
import { OrderService } from "../lib/services/orderService";
import { getT } from "@/app/lib/i18n/server";
import TrackPurchase from "../components/analytics/TrackPurchase";

type Props = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export default async function OrderSuccessPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const order = params.order ?? "";

  // Read the real status (the webhook or verify-payment has usually
  // marked it PAID by the time we land here). Scoped to the signed-in
  // customer so an order number in the URL reveals nothing on its own.
  const session = await getCustomerSession();
  const t = await getT();

  const record =
    session && order
      ? await OrderService.getCustomerOrderStatus(
          order,
          session.customerId
        )
      : null;

  const paid = record?.payment_status === "PAID";

  // Purchased books open (and save for offline) from their own page;
  // Downloads only lists books already saved to this device, so it's
  // empty right after buying — send them to the book instead.
  const books = record?.books ?? [];
  const readHref =
    books.length === 1 ? `/books/${books[0].slug}` : "/account";

  return (
    <Container>
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
        }}
      >
        {paid && record && (
          <TrackPurchase
            orderNumber={record.order_number}
            value={Number(record.total_amount)}
            books={books}
          />
        )}

        <h1>{t("success.thanks")}</h1>

        <p>
          {paid
            ? t("success.paidMsg")
            : t("success.created")}
        </p>

        <h2
          style={{
            marginTop: 30,
          }}
        >
          {t("success.orderNumber")}
        </h2>

        <h3>{order}</h3>

        <p>
          {t("success.status")}
          <strong> {paid ? t("success.paid") : t("success.pending")}</strong>
        </p>

        {paid && (
          <p>
            {t(books.length === 1 ? "success.readyOne" : "success.readyMany")}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 20,
          }}
        >
          {paid && (
            <Link
              href={readHref}
              className="book-button"
            >
              {books.length === 1
                ? t("success.readBook")
                : t("success.goBooks")}
            </Link>
          )}

          <Link
            href="/books"
            className="book-button"
          >
            {t("success.continue")}
          </Link>
        </div>
      </div>
    </Container>
  );
}
