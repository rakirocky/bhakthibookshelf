import { NextResponse } from "next/server";

import { db } from "@/app/lib/db/db";

// Cheap external signal that the process is up AND actually able to
// serve requests (not just "the event loop responded") — a stuck DB
// pool or wedged process should show here, not just as user-facing
// timeouts. Point an uptime monitor (UptimeRobot etc.) at this.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.query("SELECT 1");
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[health] DB check failed:", error);
    return NextResponse.json(
      { status: "error" },
      { status: 503 }
    );
  }
}
