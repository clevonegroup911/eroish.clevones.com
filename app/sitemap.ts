import type { MetadataRoute } from "next";

import { locales } from "@/lib/i18n";
import { publicSiteUrl } from "@/lib/site-url";

const paths = [
  "",
  "/identity",
  "/now",
  "/record",
  "/proof",
  "/ledger",
  "/thinking",
  "/challenge",
  "/ask",
  "/connect",
  "/signal",
  "/journey",
  "/places",
  "/principles",
  "/media",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = publicSiteUrl();
  const now = new Date();
  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${origin}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: {
          en: `${origin}/en${path}`,
          fr: `${origin}/fr${path}`,
        },
      },
    })),
  );
}
