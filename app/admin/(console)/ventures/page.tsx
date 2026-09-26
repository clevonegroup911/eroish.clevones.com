import { PublishButton } from "@/components/admin/publish-button";
import { prisma } from "@/lib/db";

export default async function AdminVenturesPage() {
  const items = await prisma.venture.findMany({ include: { sources: true } });
  return (
    <>
      <h1 className="editorial text-4xl">Ventures</h1>
      <p className="mt-3 text-ink-soft">Exposure only — never a CLEVONE SARL product catalogue.</p>
      <ul className="mt-8 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="border border-rule p-4">
            <h2 className="text-xl">{item.name}</h2>
            <p className="text-sm text-muted">{item.verification} · {item.publishState}</p>
            <PublishButton entity="Venture" id={item.id} />
          </li>
        ))}
      </ul>
    </>
  );
}
