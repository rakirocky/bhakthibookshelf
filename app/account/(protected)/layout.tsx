import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import AccountHeader from "@/app/components/account/AccountHeader";

// Reads live data (orders, subscription status in a later stage) — must
// not be frozen as static HTML at build time.
export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getCustomerSession();

  // Middleware already guards this route group, but Server Components
  // render independently of it — this is the belt to middleware's braces.
  if (!session) {
    redirect("/account/login");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-page)",
      }}
    >
      <AccountHeader
        label={session.name || session.phone}
      />

      <main
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
