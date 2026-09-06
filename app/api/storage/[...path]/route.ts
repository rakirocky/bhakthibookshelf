import fs from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

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
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "File not found" },
      { status: 404 }
    );
  }
}
