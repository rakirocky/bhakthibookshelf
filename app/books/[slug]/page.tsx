import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import {
  getBookBySlug,
  getRelatedBooks,
} from "@/app/lib/services/book-service";

import { fileUrl } from "@/app/lib/upload/fileUrl";
import ShareBook from "@/app/components/details/ShareBook";
import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { AccessService } from "@/app/lib/services/accessService";
import { getLanguagePreference } from "@/app/lib/language";

import Breadcrumb from "@/app/components/details/Breadcrumb";
import BookInfo from "@/app/components/details/BookInfo";
import BookDescription from "@/app/components/details/BookDescription";
import BookActions from "@/app/components/details/BookActions";
import RelatedBooks from "@/app/components/details/RelatedBooks";
import JsonLd from "@/app/lib/seo/JsonLd";
import { absoluteUrl } from "@/app/lib/seo/siteUrl";

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

  return {
    title,
    description,
    alternates: { canonical: `/books/${book.slug}` },
    // an unpublished book is still reachable by slug — keep it out of search
    ...(book.published === false ? { robots: { index: false } } : {}),
    openGraph: {
      title,
      description,
      url: `/books/${book.slug}`,
      type: "article",
      // image: ./opengraph-image.tsx (1200x630 preview card)
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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

  const cover = fileUrl(book.cover_image);
  const price = Number(book.discount_price ?? book.price);
  const bookJsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    url: absoluteUrl(`/books/${book.slug}`),
    ...(book.author ? { author: { "@type": "Person", name: book.author } } : {}),
    ...(book.publisher ? { publisher: { "@type": "Organization", name: book.publisher } } : {}),
    ...(book.description ? { description: String(book.description).replace(/\s+/g, " ").trim().slice(0, 500) } : {}),
    ...(cover ? { image: absoluteUrl(cover) } : {}),
    ...(book.pages ? { numberOfPages: book.pages } : {}),
    ...(/^(kn|kan|kannada)$/i.test(String(book.language ?? "").trim())
      ? { inLanguage: "kn" }
      : /^(en|eng|english)$/i.test(String(book.language ?? "").trim())
        ? { inLanguage: "en" }
        : {}),
    bookFormat: "https://schema.org/EBook",
    ...(Number.isFinite(price)
      ? {
          offers: {
            "@type": "Offer",
            price: price.toFixed(2),
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            url: absoluteUrl(`/books/${book.slug}`),
          },
        }
      : {}),
  };

  return (
    <main className="book-details-page">

      <JsonLd data={bookJsonLd} />

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

          <ShareBook title={book.title} slug={book.slug} />

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
