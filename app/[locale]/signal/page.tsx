import { PageIntro } from "@/components/layout/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { localeContext, sectionMetadata } from "@/lib/locale-page";
import { prisma } from "@/lib/db";
import { dbLocale } from "@/lib/queries";


export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return sectionMetadata(params, (dict) => ({ title: dict.signal.title, description: dict.signal.lead }));
}

export default async function SignalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  const posts = await prisma.signalPost.findMany({
    where: { locale: dbLocale(locale), publishState: { in: ["PUBLISHED", "REVIEW"] } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageIntro title={dict.signal.title} lead={dict.signal.lead} />
      {posts.length === 0 ? (
        <p className="px-5 py-16 text-muted md:px-8">{dict.signal.empty}</p>
      ) : (
        <ol className="divide-y divide-rule">
          {posts.map((post) => (
            <li key={post.id} className="px-5 py-8 md:px-8">
              <StatusChip status={post.verification} locale={locale} example={post.exampleFlag} />
              <p className="mt-3 text-[0.7rem] uppercase tracking-[0.14em] text-muted">{post.type}</p>
              <p className="mt-2 text-lg">{post.body}</p>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
