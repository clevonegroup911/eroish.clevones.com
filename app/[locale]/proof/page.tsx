import { PageIntro } from "@/components/layout/page-shell";
import { ProofGraph } from "@/components/proof/proof-graph";
import { localeContext, sectionMetadata } from "@/lib/locale-page";
import { getPublishedProofs } from "@/lib/queries";


export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return sectionMetadata(params, (dict) => ({ title: dict.proof.title, description: dict.proof.lead }));
}

export default async function ProofPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  const items = await getPublishedProofs();

  return (
    <>
      <PageIntro title={dict.proof.title} lead={dict.proof.lead} />
      <ProofGraph locale={locale} dict={dict} items={items} />
    </>
  );
}
