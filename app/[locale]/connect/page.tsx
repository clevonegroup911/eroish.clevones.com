import { ConnectForm } from "@/components/connect/connect-form";
import { PageIntro } from "@/components/layout/page-shell";
import { localeContext, sectionMetadata } from "@/lib/locale-page";


export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return sectionMetadata(params, (dict) => ({ title: dict.connect.title, description: dict.connect.lead }));
}

export default async function ConnectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  return (
    <>
      <PageIntro title={dict.connect.title} lead={dict.connect.lead} />
      <ConnectForm locale={locale} dict={dict} />
    </>
  );
}
