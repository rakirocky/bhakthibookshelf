import type { Metadata } from "next";

const SITE_NAME = "Bhakthi Bookshelf";

// A page's openGraph/twitter objects replace the root layout's wholesale
// (they aren't deep-merged), so each page re-states the share image too.
export function pageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      images: [{ url: "/images/logo.png", width: 818, height: 796, alt: SITE_NAME }],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
      images: ["/images/logo.png"],
    },
  };
}
