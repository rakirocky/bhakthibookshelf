import { NextResponse } from "next/server";

import { createBook } from "@/app/lib/services/book-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const book = await createBook(body);

    return NextResponse.json(book);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Unable to save book",
      },
      {
        status: 500,
      }
    );
  }
}
