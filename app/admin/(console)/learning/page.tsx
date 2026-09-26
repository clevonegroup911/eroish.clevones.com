import { decideLearningProposal } from "@/app/admin/actions";
import { prisma } from "@/lib/db";

export default async function AdminLearningPage() {
  const items = await prisma.learningProposal.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <h1 className="editorial text-4xl">Learning Engine</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Recommendations are versioned, explainable, reversible, and never applied to identity
        without approval.
      </p>
      <ul className="mt-8 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="border border-rule p-4">
            <p className="text-sm text-muted">{item.status} · reversible {String(item.reversible)}</p>
            <h2 className="mt-2 text-xl">{item.title}</h2>
            <p className="mt-2">{item.rationale}</p>
            <p className="mt-2 text-ink-soft">{item.recommendation}</p>
            {item.status === "PROPOSED" ? (
              <div className="mt-4 flex gap-2">
                <form action={decideLearningProposal.bind(null, item.id, "APPROVED")}>
                  <button className="border px-3 py-1 text-xs uppercase">Approve</button>
                </form>
                <form action={decideLearningProposal.bind(null, item.id, "REJECTED")}>
                  <button className="border px-3 py-1 text-xs uppercase">Reject</button>
                </form>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}
