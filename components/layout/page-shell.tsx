import { TckText } from "@/components/identity/tck-text";
import type { Dictionary, Locale } from "@/lib/i18n";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function PageShell({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 bg-paper px-3 py-2">
        {dict.nav.skip}
      </a>
      <SiteHeader locale={locale} dict={dict} />
      <main id="content">{children}</main>
      <SiteFooter locale={locale} dict={dict} />
    </div>
  );
}

export function PageIntro({
  kicker,
  title,
  lead,
}: {
  kicker?: string;
  title: string;
  lead: string;
}) {
  return (
    <header className="border-b border-rule px-5 py-14 md:px-8 md:py-20">
      {kicker ? (
        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">{kicker}</p>
      ) : null}
      <h1 className="editorial mt-3 text-4xl md:text-6xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-soft">
        <TckText text={lead} />
      </p>
    </header>
  );
}
