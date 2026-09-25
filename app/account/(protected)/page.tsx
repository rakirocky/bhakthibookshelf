import Link from "next/link";
import Image from "next/image";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { SubscriptionService } from "@/app/lib/services/subscriptionService";
import { OrderService } from "@/app/lib/services/orderService";
import { CustomerRepository } from "@/app/lib/repositories/customerRepository";
import { fileUrl } from "@/app/lib/upload/fileUrl";
import EmailSettingsCard from "@/app/components/account/EmailSettingsCard";
import { getT } from "@/app/lib/i18n/server";

export default async function AccountPage() {
  const session = await getCustomerSession();
  const t = await getT();

  const customer = session
    ? await CustomerRepository.getById(session.customerId)
    : null;

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
        {t("account.title")}
      </h1>

      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: 30,
        }}
      >
        {session?.name ? t("account.welcomeName", { name: session.name }) : t("account.welcomeBack")}
      </p>

      <EmailSettingsCard
        currentEmail={customer?.email ?? null}
      />

      <div
        // Read-only app: only show the card when there's a subscription
        // to report — "you don't have one" is an upsell.
        data-web-only={status?.status === "ACTIVE" ? undefined : true}
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
          {t("account.subscription")}
        </h2>

        {status?.status === "ACTIVE" && (
          <p style={{ margin: 0, color: "var(--color-success-text)" }}>
            {status.subscription!.ends_at
              ? t("account.activeUntil", { date: new Date(status.subscription!.ends_at as string).toLocaleDateString("en-IN") })
              : t("account.lifetime")}
          </p>
        )}

        {status?.status === "PENDING" && (
          <p style={{ margin: 0, color: "var(--color-warning-text)" }}>
            {t("account.pending")}
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
                ? t("account.expired")
                : t("account.noSub")}
            </p>

            <Link
              href="/subscribe"
              data-web-only
              className="btn btn-primary"
              style={{ textDecoration: "none" }}
            >
              {t("account.viewPlans")}
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
          {t("account.library")}
        </h2>

        {status?.status === "ACTIVE" ? (
          <p style={{ margin: 0, color: "var(--color-text-strong)" }}>
            {t("account.subAll")}{" "}
            <Link
              href="/books"
              style={{
                color: "var(--color-primary)",
                fontWeight: 600,
              }}
            >
              {t("account.browseAll")}
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
            {t("account.libraryEmpty")}
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
          {t("account.phone", { phone: session?.phone ?? "" })}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 20,
          }}
        >
          <Link
            href="/account/change-password"
            className="btn btn-outline"
            style={{ textDecoration: "none" }}
          >
            {t("pw.title")}
          </Link>

          <Link
            href="/account/devices"
            className="btn btn-outline"
            style={{ textDecoration: "none" }}
          >
            {t("account.manageDevices")}
          </Link>
        </div>

        <p
          style={{
            marginTop: 20,
            marginBottom: 0,
            color: "var(--color-text-muted)",
            fontSize: 14,
          }}
        >
          {t("account.ordersSoon")}
        </p>
      </div>
    </div>
  );
}
