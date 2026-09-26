import type { MetadataRoute } from "next";

import { CONFIRMED } from "@/lib/identity";

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.APP_ORIGIN ?? CONFIRMED.siteUrl;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
