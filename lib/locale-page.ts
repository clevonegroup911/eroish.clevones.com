import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function localeContext(params: Promise<{ locale: string }>) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  return { locale, dict: getDictionary(locale) };
}
