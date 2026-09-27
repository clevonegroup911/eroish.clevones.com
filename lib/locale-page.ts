import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Dictionary, type Locale } from "@/lib/i18n";

export async function localeContext(params: Promise<{ locale: string }>) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  return { locale, dict: getDictionary(locale) };
}

export async function sectionMetadata(
  params: Promise<{ locale: string }>,
  pick: (dict: Dictionary) => { title: string; description: string },
): Promise<Metadata> {
  const { locale, dict } = await localeContext(params);
  const { title, description } = pick(dict);
  return {
    title,
    description,
    alternates: {
      languages: {
        en: "/en",
        fr: "/fr",
      },
    },
    openGraph: {
      title,
      description,
      locale: locale === "fr" ? "fr" : "en",
    },
  };
}
