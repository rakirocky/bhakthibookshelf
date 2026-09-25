import fs from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { getAdminSession } from "@/app/lib/auth/getAdminSession";

// Only covers and free samples are public. Everything else under
// storage/ — above all ebooks/, the full paid PDFs — is admin-only here
// (the admin book form links to it); customers get full books solely
// through the per-device encrypted download API. The file names are
// random UUIDs, but a leaked link must not be a free copy.
const PUBLIC_FOLDERS = new Set(["covers", "samples"]);

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ path: string[] }>;
  }
) {
  const { path: segments } = await params;

  if (!segments || segments.length === 0) {
    return NextResponse.json(
      { message: "Not found" },
      { status: 404 }
    );
  }

  // Reject anything that looks like a path traversal attempt.
  const isSuspicious = segments.some(
    (segment) => segment.includes("..") || segment.includes("/")
  );

  if (isSuspicious) {
    return NextResponse.json(
      { message: "Invalid path" },
      { status: 400 }
    );
  }

  const isPublic = segments.length > 1 && PUBLIC_FOLDERS.has(segments[0]);

  if (!isPublic && !(await getAdminSession())) {
    // 404, not 401: don't confirm that a private file exists.
    return NextResponse.json(
      { message: "File not found" },
      { status: 404 }
    );
  }

  const storageRoot = path.join(process.cwd(), "storage");
  const filePath = path.join(storageRoot, ...segments);

  // Belt-and-braces: make sure the resolved path never escapes storage/.
  if (!filePath.startsWith(storageRoot)) {
    return NextResponse.json(
      { message: "Invalid path" },
      { status: 400 }
    );
  }

  try {
    const fileBuffer = await fs.readFile(filePath);

    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": isPublic
          ? "public, max-age=31536000, immutable"
          : "private, no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "File not found" },
      { status: 404 }
    );
  }
}
