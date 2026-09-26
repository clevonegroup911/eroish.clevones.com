import { ConnectForm } from "@/components/connect/connect-form";
import { PageIntro } from "@/components/layout/page-shell";
import { localeContext } from "@/lib/locale-page";

export default async function ConnectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  return (
    <>
      <PageIntro title={dict.connect.title} lead={dict.connect.lead} />
      <ConnectForm locale={locale} dict={dict} />
    </>
  );
}
