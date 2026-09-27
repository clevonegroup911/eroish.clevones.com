import { PortraitPlaceholder } from "@/components/identity/portrait-placeholder";
import { TckText } from "@/components/identity/tck-text";
import { PageIntro } from "@/components/layout/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { CONFIRMED } from "@/lib/identity";
import { localeContext, sectionMetadata } from "@/lib/locale-page";
import { getIdentity, getPublishedVentures } from "@/lib/queries";


export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return sectionMetadata(params, (dict) => ({ title: dict.identity.title, description: dict.identity.lead }));
}

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
          <p className="mt-6 text-ink-soft">
            <TckText text={identity?.multiculturalNote ?? dict.home.multicultural} />
          </p>
        </div>
        <PortraitPlaceholder
          caption={identity?.portraitCaption ?? dict.home.portraitCaption}
          overlay={dict.portrait.overlay}
        />
      </section>
      <section className="border-t border-rule px-5 py-12 md:px-8">
        <h2 className="editorial text-3xl">{dict.identity.venturesTitle}</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">{dict.identity.venturesLead}</p>
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
