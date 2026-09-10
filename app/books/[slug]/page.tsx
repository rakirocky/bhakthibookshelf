import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import {
  getBookBySlug,
  getRelatedBooks,
} from "@/app/lib/services/book-service";

import { fileUrl } from "@/app/lib/upload/fileUrl";
import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { AccessService } from "@/app/lib/services/accessService";
import { getLanguagePreference } from "@/app/lib/language";

import Breadcrumb from "@/app/components/details/Breadcrumb";
import BookInfo from "@/app/components/details/BookInfo";
import BookDescription from "@/app/components/details/BookDescription";
import BookActions from "@/app/components/details/BookActions";
import RelatedBooks from "@/app/components/details/RelatedBooks";

// Reads live data from the DB — see the same note in app/admin/layout.tsx.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    return { title: "Book not found | Bhakthi Bookshelf" };
  }

  const title = `${book.title} | Bhakthi Bookshelf`;
  const description = (
    book.subtitle ||
    book.description ||
    `${book.title} — read on Bhakthi Bookshelf.`
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
  const cover = fileUrl(book.cover_image);

  return {
    title,
    description,
    alternates: { canonical: `/books/${book.slug}` },
    openGraph: {
      title,
      description,
      url: `/books/${book.slug}`,
      type: "article",
      ...(cover ? { images: [{ url: cover, alt: book.title }] } : {}),
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title,
      description,
      ...(cover ? { images: [cover] } : {}),
    },
  };
}

export default async function BookDetailsPage({
  params,
}: Props) {
  const { slug } = await params;

  const book = await getBookBySlug(slug);

  if (!book) {
    notFound();
  }

  const language = await getLanguagePreference();

  const relatedBooks =
    await getRelatedBooks(book.slug, 4, language);

  const session = await getCustomerSession();

  const hasAccess = session
    ? await AccessService.customerHasAccessToBook(
        session.customerId,
        book.id
      )
    : false;

  return (
    <main className="book-details-page">

      <Breadcrumb
        title={book.title}
      />

      <div className="book-layout">

        <div className="book-cover">

          <Image
            src={
              fileUrl(book.cover_image) ||
              "/images/books/default-book.jpg"
            }
            alt={book.title}
            width={360}
            height={520}
            priority
          />

        </div>

        <div className="book-right">

          <BookInfo book={book} />

	  <BookActions
             book={book}
             hasAccess={hasAccess}
          />		

        </div>

      </div>

      <BookDescription
        book={book}
      />

      <RelatedBooks
        books={relatedBooks}
      />

    </main>
  );
}
