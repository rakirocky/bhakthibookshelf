import { NextResponse } from "next/server";

import { AnnouncementService } from "@/app/lib/services/announcementService";

// Public list of active announcements. The root layout renders the bar
// once per full page load; AnnouncementBar re-reads this on page changes
// and when the tab comes back, so a newly activated announcement shows
// without the visitor having to reload.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await AnnouncementService.getActive();
    return NextResponse.json(
      {
        announcements: rows.map((a: { id: number; message: string; link: string | null }) => ({
          id: a.id,
          message: a.message,
          link: a.link,
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[announcements] read failed:", error);
    return NextResponse.json({ announcements: null }, { status: 500 });
  }
}
