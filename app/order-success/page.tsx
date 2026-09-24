import Link from "next/link";
import Container from "../components/ui/Container";
import { getCustomerSession } from "../lib/auth/getCustomerSession";
import { OrderService } from "../lib/services/orderService";

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
        <h1>🎉 Thank You</h1>

        <p>
          {paid
            ? "Your payment was successful."
            : "Your order has been created successfully."}
        </p>

        <h2
          style={{
            marginTop: 30,
          }}
        >
          Order Number
        </h2>

        <h3>{order}</h3>

        <p>
          Payment Status:
          <strong> {paid ? "Paid" : "Pending"}</strong>
        </p>

        {paid && (
          <p>
            Your {books.length === 1 ? "book is" : "books are"} ready to
            read. A payment confirmation and invoice has been emailed
            to you.
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
                ? "Read your book"
                : "Go to your books"}
            </Link>
          )}

          <Link
            href="/books"
            className="book-button"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </Container>
  );
}
