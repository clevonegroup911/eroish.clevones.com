import { AskPanel } from "@/components/ask/ask-panel";
import { PageIntro } from "@/components/layout/page-shell";
import { localeContext, sectionMetadata } from "@/lib/locale-page";


export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return sectionMetadata(params, (dict) => ({ title: dict.ask.title, description: dict.ask.lead }));
}

export default async function AskPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  return (
    <>
      <PageIntro title={dict.ask.title} lead={dict.ask.lead} />
      <AskPanel locale={locale} dict={dict} />
    </>
  );
}
