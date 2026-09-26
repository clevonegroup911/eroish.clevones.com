import { notFound } from "next/navigation";

import { PageIntro } from "@/components/layout/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { localeContext } from "@/lib/locale-page";
import { prisma } from "@/lib/db";

export default async function ThinkingItemPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, ...localeParams } = await params;
  const { locale, dict } = await localeContext(Promise.resolve(localeParams));
  const piece = await prisma.thinkingPiece.findFirst({
    where: { slug, publishState: { in: ["PUBLISHED", "REVIEW"] } },
    include: { sources: true, revisions: true },
  });
  if (!piece) notFound();

  return (
    <>
      <PageIntro title={locale === "fr" ? piece.titleFr : piece.titleEn} lead={dict.thinking.lead} />
      <article className="px-5 py-12 md:px-8">
        <StatusChip status={piece.verification} locale={locale} example={piece.exampleFlag} />
        <p className="mt-8 max-w-2xl text-lg whitespace-pre-wrap">
          {locale === "fr" ? piece.bodyFr : piece.bodyEn}
        </p>
        {piece.revisions.length ? (
          <p className="mt-8 text-sm text-muted">
            {dict.thinking.revisions}: {piece.revisions.length}
          </p>
        ) : null}
      </article>
    </>
  );
}
