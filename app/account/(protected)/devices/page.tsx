import type { Metadata } from "next";

import DevicesClient from "@/app/components/account/DevicesClient";

export const metadata: Metadata = {
  title: "Manage devices | Bhakthi Bookshelf",
};

// Device list is per-account live data — never prerender.
export const dynamic = "force-dynamic";

export default function DevicesPage() {
  return <DevicesClient />;
}
