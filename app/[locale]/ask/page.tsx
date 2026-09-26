import { AskPanel } from "@/components/ask/ask-panel";
import { PageIntro } from "@/components/layout/page-shell";
import { localeContext } from "@/lib/locale-page";

export default async function AskPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  return (
    <>
      <PageIntro title={dict.ask.title} lead={dict.ask.lead} />
      <AskPanel locale={locale} dict={dict} />
    </>
  );
}
