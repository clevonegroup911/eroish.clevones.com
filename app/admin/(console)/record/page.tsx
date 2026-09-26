import { PublishButton } from "@/components/admin/publish-button";
import { prisma } from "@/lib/db";

export default async function AdminRecordPage() {
  const items = await prisma.recordEvent.findMany({ include: { sources: true }, orderBy: { year: "asc" } });
  return (
    <>
      <h1 className="editorial text-4xl">Record</h1>
      <ul className="mt-8 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="border border-rule p-4">
            <p className="text-sm text-muted">
              {item.year} · {item.kind} · {item.verification} · {item.publishState}
            </p>
            <h2 className="mt-2 text-xl">{item.titleEn}</h2>
            <PublishButton entity="RecordEvent" id={item.id} />
          </li>
        ))}
      </ul>
    </>
  );
}
