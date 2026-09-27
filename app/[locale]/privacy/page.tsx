import { PageIntro } from "@/components/layout/page-shell";
import { localeContext, sectionMetadata } from "@/lib/locale-page";


export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return sectionMetadata(params, (dict) => ({ title: dict.privacy.title, description: dict.privacy.body }));
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { dict } = await localeContext(params);
  return (
    <>
      <PageIntro title={dict.privacy.title} lead={dict.privacy.body} />
    </>
  );
}
