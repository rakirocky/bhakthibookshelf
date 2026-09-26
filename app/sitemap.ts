import type { MetadataRoute } from "next";

import { getAllBooks } from "@/app/lib/services/book-service";
import { fileUrl } from "@/app/lib/upload/fileUrl";
import { absoluteUrl } from "@/app/lib/seo/siteUrl";

// Books are added from the admin panel at any time — build the list per
// request (getAllBooks is itself cached and revalidated on admin writes)
// instead of freezing whatever existed at build time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // "all" = every published book regardless of the visitor's language filter
  const books = await getAllBooks("all");

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/books"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/festivals"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/subscribe"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/privacy-policy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms-conditions"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const bookPages: MetadataRoute.Sitemap = books.map((book) => {
    const cover = fileUrl(book.cover_image);
    return {
      url: absoluteUrl(`/books/${book.slug}`),
      lastModified: book.updated_at ?? book.created_at ?? undefined,
      changeFrequency: "weekly",
      priority: 0.8,
      ...(cover ? { images: [absoluteUrl(cover)] } : {}),
    };
  });

  return [...staticPages, ...bookPages];
}
