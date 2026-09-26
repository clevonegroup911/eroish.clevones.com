import { PortraitPlaceholder } from "@/components/identity/portrait-placeholder";
import { PageIntro } from "@/components/layout/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { CONFIRMED } from "@/lib/identity";
import { localeContext } from "@/lib/locale-page";
import { getIdentity, getPublishedVentures } from "@/lib/queries";

export default async function IdentityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  const [identity, ventures] = await Promise.all([getIdentity(locale), getPublishedVentures()]);

  return (
    <>
      <PageIntro title={dict.identity.title} lead={dict.identity.lead} />
      <section className="grid gap-10 px-5 py-12 md:grid-cols-2 md:px-8">
        <div>
          <StatusChip status="VERIFIED" locale={locale} />
          <h2 className="editorial mt-4 text-4xl">{CONFIRMED.fullName}</h2>
          <p className="mt-2 text-xl">{CONFIRMED.publicName}</p>
          <p className="mt-6 space-y-2 text-lg">
            <span className="block">{identity?.summary}</span>
          </p>
          <p className="mt-6 text-ink-soft">{identity?.multiculturalNote}</p>
        </div>
        <PortraitPlaceholder caption={identity?.portraitCaption ?? dict.home.portraitCaption} />
      </section>
      <section className="border-t border-rule px-5 py-12 md:px-8">
        <h2 className="editorial text-3xl">{locale === "fr" ? "Ventures — exposition" : "Ventures — exposure"}</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          {locale === "fr"
            ? "Pas un catalogue de produits. Un parcours entrepreneurial."
            : "Not a product catalogue. An entrepreneurial journey."}
        </p>
        <ul className="mt-8 grid gap-4">
          {ventures.map((venture) => (
            <li key={venture.id} className="border border-rule p-5">
              <StatusChip status={venture.verification} locale={locale} example={venture.exampleFlag} />
              <h3 className="editorial mt-3 text-2xl">{venture.name}</h3>
              <p className="mt-2">{locale === "fr" ? venture.roleFr : venture.roleEn}</p>
              <p className="mt-2 text-ink-soft">{locale === "fr" ? venture.summaryFr : venture.summaryEn}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
