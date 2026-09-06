import { NextResponse } from "next/server";

import { getAllBooks } from "@/app/lib/services/book-service";

export async function GET() {
  try {
    const books = await getAllBooks();

    return NextResponse.json(books);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Unable to fetch books",
      },
      {
        status: 500,
      }
    );
  }
}
