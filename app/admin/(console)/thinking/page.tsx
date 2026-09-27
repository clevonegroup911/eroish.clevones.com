import { PublishButton } from "@/components/admin/publish-button";
import { requireAdmin } from "@/lib/admin/session";
import { prisma } from "@/lib/db";

export default async function AdminThinkingPage() {
  await requireAdmin();
  const items = await prisma.thinkingPiece.findMany({ include: { sources: true } });
  return (
    <>
      <h1 className="editorial text-4xl">Thinking</h1>
      <ul className="mt-8 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="border border-rule p-4">
            <h2 className="text-xl">{item.titleEn}</h2>
            <p className="text-sm text-muted">{item.exampleFlag} · {item.publishState}</p>
            <PublishButton entity="ThinkingPiece" id={item.id} />
          </li>
        ))}
      </ul>
    </>
  );
}
