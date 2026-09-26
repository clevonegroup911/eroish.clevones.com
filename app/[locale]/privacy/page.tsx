import { PageIntro } from "@/components/layout/page-shell";
import { localeContext } from "@/lib/locale-page";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { dict } = await localeContext(params);
  return (
    <>
      <PageIntro title={dict.privacy.title} lead={dict.privacy.body} />
    </>
  );
}
