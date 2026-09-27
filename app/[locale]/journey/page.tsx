import { JourneyChapters } from "@/components/journey/journey-chapters";
import { PageIntro } from "@/components/layout/page-shell";
import { localeContext, sectionMetadata } from "@/lib/locale-page";


export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return sectionMetadata(params, (dict) => ({ title: dict.journey.title, description: dict.journey.lead }));
}

export default async function JourneyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  return (
    <>
      <PageIntro title={dict.journey.title} lead={dict.journey.lead} />
      <section className="px-5 py-12 md:px-8">
        <JourneyChapters locale={locale} />
      </section>
    </>
  );
}
