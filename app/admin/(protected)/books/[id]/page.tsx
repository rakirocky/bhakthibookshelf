import { notFound } from "next/navigation";

import BookForm from "@/app/components/admin/BookForm";
import { getBookById } from "@/app/lib/services/book-service";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const book = await getBookById(Number(id));

  if (!book) {
    notFound();
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Edit Book</h1>

      <BookForm
        mode="edit"
        bookId={book.id}
        initialValues={{
          slug: book.slug,
          title: book.title,
          author: book.author,
          description: book.description ?? "",
          price: String(book.price),
          cover_image: book.cover_image ?? "",
          sample_pdf: book.sample_pdf ?? "",
          full_pdf: book.full_pdf ?? "",
          featured: book.featured,
          published: book.published,
          language: book.language ?? "English",
        }}
      />
    </div>
  );
}
