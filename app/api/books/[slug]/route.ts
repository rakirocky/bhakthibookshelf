import { NextResponse } from "next/server";

import { getBookBySlug } from "@/app/lib/services/book-service";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Props
) {
  const { slug } = await params;

  const book = await getBookBySlug(slug);

  if (!book) {
    return NextResponse.json(
      {
        message: "Book not found",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(book);
}
