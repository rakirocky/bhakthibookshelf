import fs from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { AccessService } from "@/app/lib/services/accessService";
import { getBookById } from "@/app/lib/services/book-service";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ bookId: string }>;
  }
) {
  const { bookId } = await params;

  const session = await getCustomerSession();

  // Belt-and-braces — middleware already blocks this route for anyone
  // without a session, but a Route Handler shouldn't trust that alone.
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  const book = await getBookById(Number(bookId));

  if (!book || !book.full_pdf) {
    return NextResponse.json(
      { success: false, message: "Book not found." },
      { status: 404 }
    );
  }

  const hasAccess =
    await AccessService.customerHasAccessToBook(
      session.customerId,
      book.id
    );

  if (!hasAccess) {
    console.log(
      `[download] denied — customer ${session.phone} has no access to book ${book.id} (${book.title})`
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "You don't have access to this book yet. Purchase it or subscribe to unlock it.",
      },
      { status: 403 }
    );
  }

  // full_pdf is stored the same way cover images are — a relative path
  // like "storage/ebooks/xxx.pdf" — read directly here rather than going
  // through /api/storage, since that route is intentionally public and
  // full books must not be.
  const filePath = path.join(
    process.cwd(),
    book.full_pdf
  );

  try {
    const fileBuffer = await fs.readFile(filePath);

    console.log(
      `[download] granted — customer ${session.phone} downloaded book ${book.id} (${book.title})`
    );

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${book.slug}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "File not found on server.",
      },
      { status: 404 }
    );
  }
}
