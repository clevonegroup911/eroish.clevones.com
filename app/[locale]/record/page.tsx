import { PageIntro } from "@/components/layout/page-shell";
import { RecordTimeline } from "@/components/record/timeline";
import { localeContext } from "@/lib/locale-page";
import { getPublishedRecord } from "@/lib/queries";

export default async function RecordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  const items = await getPublishedRecord();

  return (
    <>
      <PageIntro title={dict.record.title} lead={dict.record.lead} />
      <RecordTimeline locale={locale} dict={dict} items={items} />
    </>
  );
}
