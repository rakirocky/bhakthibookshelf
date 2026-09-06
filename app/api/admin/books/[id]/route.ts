import { NextResponse } from "next/server";

import {
  deleteBook,
  updateBook,
} from "@/app/lib/services/book-service";

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const body = await request.json();

    const { id } = await params;

    const book = await updateBook(
      Number(id),
      body
    );

    return NextResponse.json(book);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    await deleteBook(Number(id));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Delete failed" },
      { status: 500 }
    );
  }
}
