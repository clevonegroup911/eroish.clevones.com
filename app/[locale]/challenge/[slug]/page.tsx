import { notFound } from "next/navigation";

import { ChallengeForm } from "@/components/challenge/challenge-form";
import { PageIntro } from "@/components/layout/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { localeContext } from "@/lib/locale-page";
import { prisma } from "@/lib/db";

export default async function ThesisPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolved = await params;
  const { locale, dict } = await localeContext(Promise.resolve({ locale: resolved.locale }));
  const thesis = await prisma.thesis.findFirst({
    where: { slug: resolved.slug, publishState: { in: ["PUBLISHED", "REVIEW"] } },
    include: {
      versions: { orderBy: { version: "asc" } },
      challenges: { where: { moderation: { in: ["APPROVED", "RESPONDED"] } } },
    },
  });
  if (!thesis) notFound();

  return (
    <>
      <PageIntro title={locale === "fr" ? thesis.titleFr : thesis.titleEn} lead={dict.challenge.lead} />
      <article className="px-5 py-12 md:px-8">
        <StatusChip status={thesis.verification} locale={locale} example={thesis.exampleFlag} />
        <p className="mt-6 max-w-2xl text-lg whitespace-pre-wrap">
          {locale === "fr" ? thesis.bodyFr : thesis.bodyEn}
        </p>
        <h2 className="editorial mt-12 text-2xl">{dict.challenge.versions}</h2>
        <ol className="mt-4 space-y-4">
          {thesis.versions.map((version) => (
            <li key={version.id} className="border border-rule p-4">
              <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">v{version.version}</p>
              <p className="mt-2">{locale === "fr" ? version.noteFr : version.noteEn}</p>
            </li>
          ))}
        </ol>
        {thesis.challenges.length ? (
          <ul className="mt-8 space-y-3">
            {thesis.challenges.map((entry) => (
              <li key={entry.id} className="border border-rule p-4">
                <p className="text-sm uppercase tracking-[0.12em] text-muted">{entry.kind}</p>
                <p className="mt-2">{entry.body}</p>
                {entry.ejcResponse ? <p className="mt-3 text-ink-soft">{entry.ejcResponse}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
        {thesis.open ? <ChallengeForm slug={thesis.slug} dict={dict} /> : null}
      </article>
    </>
  );
}
