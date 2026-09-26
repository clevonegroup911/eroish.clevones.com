import { PublishButton } from "@/components/admin/publish-button";
import { prisma } from "@/lib/db";

export default async function AdminProofsPage() {
  const items = await prisma.proofItem.findMany({ include: { sources: true } });
  return (
    <>
      <h1 className="editorial text-4xl">Proofs</h1>
      <ul className="mt-8 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="border border-rule p-4">
            <p className="text-sm text-muted">
              {item.verification} · {item.publishState} · sources {item.sources.length}
            </p>
            <h2 className="mt-2 text-xl">{item.claimEn}</h2>
            <PublishButton entity="ProofItem" id={item.id} />
          </li>
        ))}
      </ul>
    </>
  );
}
