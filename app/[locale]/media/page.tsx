import { PageIntro } from "@/components/layout/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { localeContext, sectionMetadata } from "@/lib/locale-page";
import { prisma } from "@/lib/db";


export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return sectionMetadata(params, (dict) => ({ title: dict.media.title, description: dict.media.lead }));
}

export default async function MediaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  const items = await prisma.mediaItem.findMany({
    where: { publishState: { in: ["PUBLISHED", "REVIEW"] } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageIntro title={dict.media.title} lead={dict.media.lead} />
      {items.length === 0 ? (
        <p className="px-5 py-16 text-muted md:px-8">{dict.media.empty}</p>
      ) : (
        <ul className="divide-y divide-rule">
          {items.map((item) => (
            <li key={item.id} className="px-5 py-8 md:px-8">
              <StatusChip status={item.verification} locale={locale} example={item.exampleFlag} />
              <h2 className="editorial mt-3 text-2xl">{locale === "fr" ? item.titleFr : item.titleEn}</h2>
              <p className="mt-2 text-muted">{locale === "fr" ? item.outletFr : item.outletEn}</p>
              <p className="mt-3">{locale === "fr" ? item.summaryFr : item.summaryEn}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
