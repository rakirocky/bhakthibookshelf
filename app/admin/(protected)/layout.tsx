import { ReactNode } from "react";

import { getAdminSession } from "@/app/lib/auth/getAdminSession";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

// The whole admin section reads live data (book count, orders, revenue,
// lists). Without this, Next.js prerenders these pages as static HTML at
// `npm run build` time and only refreshes them on the next build — which
// silently hides anything added/edited/deleted afterward.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAdminSession();

  const adminLabel =
    session?.name || session?.phone || "Admin";

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <div>
        <AdminHeader adminLabel={adminLabel} />

        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
