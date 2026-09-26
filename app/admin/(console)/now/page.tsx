import { PublishButton } from "@/components/admin/publish-button";
import { prisma } from "@/lib/db";

export default async function AdminNowPage() {
  const items = await prisma.nowItem.findMany({ include: { sources: true }, orderBy: { kind: "asc" } });
  return (
    <>
      <h1 className="editorial text-4xl">Now</h1>
      <ul className="mt-8 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="border border-rule p-4">
            <p className="text-[0.7rem] uppercase tracking-[0.12em] text-muted">
              {item.kind} · {item.locale} · {item.verification} · {item.publishState} · {item.exampleFlag}
            </p>
            <h2 className="mt-2 text-xl">{item.title}</h2>
            <p className="mt-2 text-sm">{item.body}</p>
            <p className="mt-2 text-sm text-muted">Sources: {item.sources.length}</p>
            <PublishButton entity="NowItem" id={item.id} />
          </li>
        ))}
      </ul>
    </>
  );
}
