import Link from "next/link";
import Container from "../components/ui/Container";

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

  return (
    <Container>
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
        }}
      >
        <h1>🎉 Thank You</h1>

        <p>Your order has been created successfully.</p>

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
          <strong> Pending</strong>
        </p>

        <Link
          href="/books"
          className="book-button"
        >
          Continue Shopping
        </Link>
      </div>
    </Container>
  );
}
