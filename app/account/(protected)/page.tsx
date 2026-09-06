import Link from "next/link";
import Image from "next/image";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { SubscriptionService } from "@/app/lib/services/subscriptionService";
import { OrderService } from "@/app/lib/services/orderService";
import { fileUrl } from "@/app/lib/upload/fileUrl";

export default async function AccountPage() {
  const session = await getCustomerSession();

  const status = session
    ? await SubscriptionService.getStatusForCustomer(
        session.customerId
      )
    : null;

  const purchasedBooks = session
    ? await OrderService.getPurchasedBooksForCustomer(
        session.customerId
      )
    : [];

  return (
    <div>
      <h1
        style={{
          marginTop: 0,
          marginBottom: 10,
        }}
      >
        My Account
      </h1>

      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: 30,
        }}
      >
        Welcome back
        {session?.name ? `, ${session.name}` : ""}.
      </p>

      <div
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: 30,
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: 18,
          }}
        >
          Subscription
        </h2>

        {status?.status === "ACTIVE" && (
          <p style={{ margin: 0, color: "var(--color-success-text)" }}>
            ✓ Active until{" "}
            {new Date(
              status.subscription!.ends_at as string
            ).toLocaleDateString("en-IN")}
          </p>
        )}

        {status?.status === "PENDING" && (
          <p style={{ margin: 0, color: "var(--color-warning-text)" }}>
            Payment pending confirmation.
          </p>
        )}

        {(status?.status === "NONE" ||
          status?.status === "EXPIRED") && (
          <>
            <p
              style={{
                margin: "0 0 16px",
                color: "var(--color-text-secondary)",
              }}
            >
              {status?.status === "EXPIRED"
                ? "Your subscription has expired."
                : "You don't have an active subscription."}
            </p>

            <Link
              href="/subscribe"
              className="btn btn-primary"
              style={{ textDecoration: "none" }}
            >
              View Plans
            </Link>
          </>
        )}
      </div>

      <div
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: 30,
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: 18,
          }}
        >
          My Library
        </h2>

        {status?.status === "ACTIVE" ? (
          <p style={{ margin: 0, color: "var(--color-text-strong)" }}>
            Your subscription gives you access to every
            book in the library.{" "}
            <Link
              href="/books"
              style={{
                color: "var(--color-primary)",
                fontWeight: 600,
              }}
            >
              Browse all books →
            </Link>
          </p>
        ) : purchasedBooks.length === 0 ? (
          <p
            style={{
              margin: 0,
              color: "var(--color-text-muted)",
              fontSize: 14,
            }}
          >
            Books you purchase will show up here once
            payment is confirmed.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 20,
            }}
          >
            {purchasedBooks.map((book: any) => (
              <Link
                key={book.id}
                href={`/books/${book.slug}`}
                style={{ textDecoration: "none" }}
              >
                <Image
                  src={
                    fileUrl(book.cover_image) ||
                    "/images/books/default-book.jpg"
                  }
                  alt={book.title}
                  width={140}
                  height={200}
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 8,
                  }}
                />

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 13,
                    color: "var(--color-text-strong)",
                    fontWeight: 600,
                  }}
                >
                  {book.title}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: 30,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "var(--color-text-strong)",
          }}
        >
          Phone: {session?.phone}
        </p>

        <Link
          href="/account/change-password"
          className="btn btn-outline"
          style={{
            display: "inline-block",
            marginTop: 20,
            textDecoration: "none",
          }}
        >
          Change Password
        </Link>

        <p
          style={{
            marginTop: 20,
            marginBottom: 0,
            color: "var(--color-text-muted)",
            fontSize: 14,
          }}
        >
          Order history is coming here next.
        </p>
      </div>
    </div>
  );
}
