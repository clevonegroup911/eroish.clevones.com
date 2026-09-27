import Link from "next/link";

import { PageIntro } from "@/components/layout/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { localeContext, sectionMetadata } from "@/lib/locale-page";
import { prisma } from "@/lib/db";


export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return sectionMetadata(params, (dict) => ({ title: dict.challenge.title, description: dict.challenge.lead }));
}

export default async function ChallengeIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  const theses = await prisma.thesis.findMany({
    where: { publishState: { in: ["PUBLISHED", "REVIEW"] } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageIntro title={dict.challenge.title} lead={dict.challenge.lead} />
      <ul className="divide-y divide-rule">
        {theses.map((thesis) => (
          <li key={thesis.id} className="px-5 py-10 md:px-8">
            <StatusChip status={thesis.verification} locale={locale} example={thesis.exampleFlag} />
            <h2 className="editorial mt-3 text-3xl">
              <Link href={`/${locale}/challenge/${thesis.slug}`}>
                {locale === "fr" ? thesis.titleFr : thesis.titleEn}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-muted">v{thesis.version}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
