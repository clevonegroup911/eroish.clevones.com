import { PublishButton } from "@/components/admin/publish-button";
import { requireAdmin } from "@/lib/admin/session";
import { prisma } from "@/lib/db";

export default async function AdminPlacesPage() {
  await requireAdmin();
  const items = await prisma.place.findMany({ include: { sources: true }, orderBy: { sortOrder: "asc" } });
  return (
    <>
      <h1 className="editorial text-4xl">Places</h1>
      <p className="mt-3 text-ink-soft">
        Confirmed coordinates may appear on the public map. Unconfirmed places stay labelled.
      </p>
      <ul className="mt-8 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="border border-rule p-4">
            <p className="text-sm text-muted">
              {item.confirmation} · {item.verification} · {item.publishState}
            </p>
            <h2 className="mt-2 text-xl">{item.nameEn}</h2>
            <PublishButton entity="Place" id={item.id} />
          </li>
        ))}
      </ul>
    </>
  );
}
