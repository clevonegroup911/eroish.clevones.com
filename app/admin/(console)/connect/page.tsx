import { requireAdmin } from "@/lib/admin/session";
import { prisma } from "@/lib/db";

export default async function AdminConnectPage() {
  await requireAdmin();
  const items = await prisma.connectRequest.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <h1 className="editorial text-4xl">Contact requests</h1>
      {items.length === 0 ? <p className="mt-6 text-muted">No requests.</p> : (
        <ul className="mt-8 space-y-4">
          {items.map((item) => (
            <li key={item.id} className="border border-rule p-4">
              <p className="text-sm text-muted">{item.intent} · {item.status} · {item.createdAt.toISOString()}</p>
              <h2 className="mt-2 text-xl">{item.name} — {item.organization}</h2>
              <p className="mt-2">{item.reason}</p>
              <p className="mt-2 text-sm">{item.whyEjc}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
