import { PageIntro } from "@/components/layout/page-shell";
import { localeContext } from "@/lib/locale-page";

export default async function PrinciplesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { dict } = await localeContext(params);
  return (
    <>
      <PageIntro title={dict.principles.title} lead={dict.principles.lead} />
      <section className="px-5 py-12 md:px-8">
        <h2 className="editorial text-3xl">{dict.principles.platform}</h2>
        <p className="mt-4 text-xl">{dict.cycles.platform}</p>
        <p className="mt-3 text-ink-soft">{dict.cycles.signal}</p>
        <h2 className="editorial mt-12 text-3xl">{dict.principles.personal}</h2>
        <p className="mt-4 status-chip text-needs border-needs">{dict.verification.needsConfirmation}</p>
        <p className="mt-4 max-w-2xl">{dict.principles.personalEmpty}</p>
      </section>
    </>
  );
}
