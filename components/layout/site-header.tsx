import Link from "next/link";

import { ExploreLayer } from "@/components/explore/explore-layer";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { Dictionary, Locale } from "@/lib/i18n";

export function SiteHeader({
  locale,
  dict,
  inverted,
}: {
  locale: Locale;
  dict: Dictionary;
  inverted?: boolean;
}) {
  const other = locale === "en" ? "fr" : "en";
  const prefix = `/${locale}`;

  return (
    <header
      className={`relative flex items-center justify-between gap-4 border-b px-5 py-4 md:px-8 ${
        inverted ? "border-white/20 text-paper" : "border-rule text-ink"
      }`}
    >
      <Link href={prefix} className="editorial text-xl tracking-tight">
        {dict.brand.signature}
      </Link>
      <nav aria-label="Primary" className="hidden items-center gap-5 text-[0.72rem] uppercase tracking-[0.14em] lg:flex">
        <Link href={`${prefix}/identity`}>{dict.nav.who}</Link>
        <Link href={`${prefix}/now`}>{dict.nav.now}</Link>
        <Link href={`${prefix}/record`}>{dict.nav.record}</Link>
        <Link href={`${prefix}/proof`}>{dict.nav.proof}</Link>
        <Link href={`${prefix}/ask`}>{dict.nav.ask}</Link>
        <Link href={`${prefix}/connect`}>{dict.nav.connect}</Link>
      </nav>
      <div className="flex items-center gap-3">
        <MobileNav locale={locale} dict={dict} />
        <ExploreLayer locale={locale} dict={dict} />
        <Link
          href={`/${other}`}
          hrefLang={other}
          className="text-[0.72rem] uppercase tracking-[0.14em]"
        >
          {other === "fr" ? "FR" : "EN"}
        </Link>
      </div>
    </header>
  );
}
