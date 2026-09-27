import type { Metadata } from "next";
import Link from "next/link";

import { PortraitPlaceholder } from "@/components/identity/portrait-placeholder";
import { TckText } from "@/components/identity/tck-text";
import { JourneyChapters } from "@/components/journey/journey-chapters";
import { StatusChip } from "@/components/ui/status-chip";
import { CONFIRMED } from "@/lib/identity";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { plural } from "@/lib/plural";
import { getIdentity, getPublishedPlaces, getPublishedProofs, getPublishedVentures } from "@/lib/queries";
import { prisma } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: { absolute: dict.meta.title },
    description: dict.meta.description,
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const dict = getDictionary(locale);
  const [identity, proofs, places, ventures, placeholderPlaces] = await Promise.all([
    getIdentity(locale),
    getPublishedProofs(),
    getPublishedPlaces(),
    getPublishedVentures(),
    prisma.place.findMany({ where: { publishState: "REVIEW" }, orderBy: { sortOrder: "asc" } }),
  ]);

  const prefix = `/${locale}`;
  const systems = [
    [dict.nav.now, `${prefix}/now`],
    [dict.nav.record, `${prefix}/record`],
    [dict.nav.proof, `${prefix}/proof`],
    [dict.nav.thinking, `${prefix}/thinking`],
    [dict.nav.ask, `${prefix}/ask`],
    [dict.nav.challenge, `${prefix}/challenge`],
    [dict.nav.connect, `${prefix}/connect`],
  ] as const;
  const tagline = identity?.commandLine?.trim() ?? "";

  return (
    <>
      <section className="bg-deep text-paper">
        <div className="grid min-h-[86vh] items-end gap-10 px-5 py-16 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-20">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-paper/70">
              {dict.home.presenceKicker}
            </p>
            <p className="mt-6 editorial text-6xl leading-none md:text-8xl">{dict.brand.signature}</p>
            <h1 className="mt-6 editorial text-3xl md:text-5xl">{dict.brand.publicName}</h1>
            <p className="mt-4 text-[0.8rem] uppercase tracking-[0.18em]">{dict.brand.roles}</p>
            {tagline ? (
              <p className="mt-8 editorial text-2xl md:text-3xl">
                {tagline}{" "}
                <StatusChip status="NEEDS_CONFIRMATION" locale={locale} />
              </p>
            ) : null}
            <p className="mt-8 max-w-xl text-paper/80">{dict.home.notThis}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={`${prefix}/record`}
                className="border border-paper px-5 py-2 text-[0.72rem] uppercase tracking-[0.16em]"
              >
                {dict.home.enter}
              </Link>
              <Link
                href={`${prefix}/identity`}
                className="border border-paper/40 px-5 py-2 text-[0.72rem] uppercase tracking-[0.16em]"
              >
                {dict.nav.who}
              </Link>
            </div>
          </div>
          <PortraitPlaceholder
            caption={identity?.portraitCaption ?? dict.home.portraitCaption}
            overlay={dict.portrait.overlay}
            onDark
          />
        </div>
      </section>

      <section className="grid gap-10 border-b border-rule px-5 py-16 md:grid-cols-2 md:px-8">
        <div>
          <h2 className="editorial text-3xl">{dict.home.confirmedTitle}</h2>
          <ul className="mt-6 space-y-3 text-lg">
            <li>{CONFIRMED.fullName}</li>
            <li>
              {CONFIRMED.publicName} · {CONFIRMED.signature}
            </li>
            <li>
              {dict.home.nationality} · {dict.brand.title}
            </li>
            <li>
              {dict.home.bornIn} {CONFIRMED.birthPlaceCity},{" "}
              {locale === "fr" ? CONFIRMED.birthDateDisplayFr : CONFIRMED.birthDateDisplayEn}
            </li>
            <li>
              {dict.home.associatedWith} {CONFIRMED.organization}
            </li>
            <li>
              <TckText text={dict.home.multicultural} />
            </li>
          </ul>
        </div>
        <div>
          <h2 className="editorial text-3xl">{dict.home.unconfirmedTitle}</h2>
          <p className="mt-6 text-lg text-ink-soft">{dict.home.unconfirmedBody}</p>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8">
        <h2 className="editorial text-3xl">{dict.home.chaptersTitle}</h2>
        <div className="mt-10">
          <JourneyChapters locale={locale} />
        </div>
      </section>

      <section className="border-t border-rule px-5 py-16 md:px-8">
        <h2 className="editorial text-3xl">{dict.home.systemsTitle}</h2>
        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {systems.map(([label, href]) => (
            <li key={href}>
              <Link href={href} className="flex items-center justify-between border border-rule px-4 py-4 hover:bg-paper-2">
                <span>{label}</span>
                <span aria-hidden>→</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted">
          {plural(proofs.length, dict.counts.proofs)} · {plural(places.length, dict.counts.places)} ·{" "}
          {plural(ventures.length, dict.counts.ventures)} ·{" "}
          {plural(placeholderPlaces.length, dict.counts.pendingPlaces)}
        </p>
      </section>
    </>
  );
}
