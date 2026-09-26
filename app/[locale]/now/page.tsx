import { PageIntro } from "@/components/layout/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { localeContext } from "@/lib/locale-page";
import { prisma } from "@/lib/db";
import { dbLocale } from "@/lib/queries";

export default async function NowPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  const items = await prisma.nowItem.findMany({
    where: { locale: dbLocale(locale), publishState: { in: ["PUBLISHED", "REVIEW"] } },
    include: { sources: true },
    orderBy: { kind: "asc" },
  });

  return (
    <>
      <PageIntro title={dict.now.title} lead={dict.now.lead} />
      {items.length === 0 ? (
        <p className="px-5 py-16 text-muted md:px-8">{dict.now.empty}</p>
      ) : (
        <ul className="grid gap-4 px-5 py-12 md:grid-cols-2 md:px-8">
          {items.map((item) => (
            <li key={item.id} className="border border-rule p-5">
              <StatusChip status={item.verification} locale={locale} example={item.exampleFlag} />
              <p className="mt-3 text-[0.7rem] uppercase tracking-[0.14em] text-muted">
                {dict.nowKinds[item.kind]}
              </p>
              <h2 className="editorial mt-2 text-2xl">{item.title}</h2>
              <p className="mt-3">{item.body}</p>
              {item.exampleFlag === "EXAMPLE" ? (
                <p className="mt-4 text-sm text-needs">{dict.now.exampleBanner}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
