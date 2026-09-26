import { PublishButton } from "@/components/admin/publish-button";
import { prisma } from "@/lib/db";

export default async function AdminMediaPage() {
  const items = await prisma.mediaItem.findMany({ include: { sources: true } });
  return (
    <>
      <h1 className="editorial text-4xl">Media</h1>
      <ul className="mt-8 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="border border-rule p-4">
            <h2 className="text-xl">{item.titleEn}</h2>
            <p className="text-sm text-muted">{item.exampleFlag} · {item.verification}</p>
            <PublishButton entity="MediaItem" id={item.id} />
          </li>
        ))}
      </ul>
    </>
  );
}
