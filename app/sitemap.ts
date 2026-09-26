import type { MetadataRoute } from "next";

import { CONFIRMED } from "@/lib/identity";
import { locales } from "@/lib/i18n";

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
  const origin = process.env.APP_ORIGIN ?? CONFIRMED.siteUrl;
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
