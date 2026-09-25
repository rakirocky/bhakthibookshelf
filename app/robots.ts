import type { MetadataRoute } from "next";

import { SITE_URL } from "@/app/lib/seo/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // Book covers (and the free samples) are served through /api/storage —
      // keep those crawlable so they can show in image search.
      allow: ["/", "/api/storage/covers/", "/api/storage/samples/"],
      disallow: [
        "/admin",
        "/api/",
        "/account",
        "/cart",
        "/checkout",
        "/order-success",
        "/reader",
        "/downloads",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
