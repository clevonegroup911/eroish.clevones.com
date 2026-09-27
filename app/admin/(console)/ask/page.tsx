import { PublishButton } from "@/components/admin/publish-button";
import { requireAdmin } from "@/lib/admin/session";
import { prisma } from "@/lib/db";

export default async function AdminAskPage() {
  await requireAdmin();
  const items = await prisma.askSource.findMany();
  return (
    <>
      <h1 className="editorial text-4xl">Ask EJC knowledge</h1>
      <p className="mt-3 text-ink-soft">Approved sources only. No source, no invented fact.</p>
      <ul className="mt-8 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="border border-rule p-4">
            <h2 className="text-xl">{item.titleEn}</h2>
            <p className="text-sm text-muted">{item.canonicalUrl} · approved {String(item.approved)}</p>
            <PublishButton entity="AskSource" id={item.id} />
          </li>
        ))}
      </ul>
    </>
  );
}
