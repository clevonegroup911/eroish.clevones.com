import Link from "next/link";

import type { Dictionary, Locale } from "@/lib/i18n";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const prefix = `/${locale}`;
  return (
    <footer className="border-t border-rule px-5 py-10 md:px-8">
      <p className="editorial text-2xl">{dict.brand.signature}</p>
      <p className="mt-3 max-w-xl text-sm text-muted">{dict.footer.official}</p>
      <p className="mt-2 text-sm">{dict.footer.cycle}</p>
      <nav aria-label="Footer" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[0.72rem] uppercase tracking-[0.12em]">
        <Link href={`${prefix}/journey`}>{dict.nav.journey}</Link>
        <Link href={`${prefix}/places`}>{dict.nav.places}</Link>
        <Link href={`${prefix}/thinking`}>{dict.nav.thinking}</Link>
        <Link href={`${prefix}/challenge`}>{dict.nav.challenge}</Link>
        <Link href={`${prefix}/ledger`}>{dict.nav.ledger}</Link>
        <Link href={`${prefix}/signal`}>{dict.nav.signal}</Link>
        <Link href={`${prefix}/privacy`}>{dict.nav.privacy}</Link>
      </nav>
    </footer>
  );
}
