import Link from "next/link";

import { PageIntro } from "@/components/layout/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { localeContext, sectionMetadata } from "@/lib/locale-page";
import { prisma } from "@/lib/db";


export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return sectionMetadata(params, (dict) => ({ title: dict.thinking.title, description: dict.thinking.lead }));
}

export default async function ThinkingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  const pieces = await prisma.thinkingPiece.findMany({
    where: { publishState: { in: ["PUBLISHED", "REVIEW"] } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageIntro title={dict.thinking.title} lead={dict.thinking.lead} />
      {pieces.length === 0 ? (
        <p className="px-5 py-16 text-muted md:px-8">{dict.thinking.empty}</p>
      ) : (
        <ul className="divide-y divide-rule">
          {pieces.map((piece) => (
            <li key={piece.id} className="px-5 py-10 md:px-8">
              <StatusChip status={piece.verification} locale={locale} example={piece.exampleFlag} />
              <p className="mt-3 text-[0.7rem] uppercase tracking-[0.14em] text-muted">
                {piece.category} · {piece.format}
              </p>
              <h2 className="editorial mt-2 text-3xl">
                <Link href={`/${locale}/thinking/${piece.slug}`}>
                  {locale === "fr" ? piece.titleFr : piece.titleEn}
                </Link>
              </h2>
              {piece.exampleFlag === "EXAMPLE" ? (
                <p className="mt-3 text-sm text-needs">{dict.thinking.exampleBanner}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
