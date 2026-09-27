import { PageIntro } from "@/components/layout/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { localeContext, sectionMetadata } from "@/lib/locale-page";
import { prisma } from "@/lib/db";


export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return sectionMetadata(params, (dict) => ({ title: dict.ledger.title, description: dict.ledger.lead }));
}

export default async function LedgerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  const items = await prisma.ledgerCommitment.findMany({
    where: { publishState: { in: ["PUBLISHED", "REVIEW"] } },
    include: { history: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageIntro title={dict.ledger.title} lead={dict.ledger.lead} />
      {items.length === 0 ? (
        <p className="px-5 py-16 text-muted md:px-8">{dict.ledger.empty}</p>
      ) : (
        <ul className="divide-y divide-rule">
          {items.map((item) => (
            <li key={item.id} className="px-5 py-10 md:px-8">
              <StatusChip status={item.verification} locale={locale} example={item.exampleFlag} />
              <h2 className="editorial mt-3 text-3xl">{locale === "fr" ? item.titleFr : item.titleEn}</h2>
              <p className="mt-2 text-[0.7rem] uppercase tracking-[0.14em] text-muted">{item.state}</p>
              <p className="mt-4 max-w-2xl">{locale === "fr" ? item.bodyFr : item.bodyEn}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
