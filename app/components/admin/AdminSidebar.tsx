"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  {
    title: "Dashboard",
    href: "/admin",
  },
  {
    title: "Books",
    href: "/admin/books",
  },
  {
    title: "Orders",
    href: "/admin/orders",
  },
  {
    title: "Subscriptions",
    href: "/admin/subscriptions",
  },
  {
    title: "Customers",
    href: "/admin/customers",
  },
  {
    title: "Password Resets",
    href: "/admin/password-resets",
  },
  {
    title: "Promoters",
    href: "/admin/promoters",
  },
  {
    title: "Reports",
    href: "/admin/reports",
  },
  {
    title: "Contact Messages",
    href: "/admin/contact-messages",
  },
  {
    title: "Announcements",
    href: "/admin/announcements",
  },
  {
    title: "Newsletter",
    href: "/admin/newsletter",
  },
  {
    title: "Settings",
    href: "/admin/settings",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <h2
        style={{
          marginBottom: 40,
          color: "var(--color-primary)",
        }}
      >
        Bhakthi Admin
      </h2>

      <nav className="admin-nav">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              textDecoration: "none",
              padding: "12px 16px",
              borderRadius: 8,
              background:
                pathname === item.href
                  ? "var(--color-primary)"
                  : "transparent",
              color:
                pathname === item.href
                  ? "var(--color-white)"
                  : "var(--color-text-strong)",
              fontWeight: 600,
            }}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
