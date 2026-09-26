import { prisma } from "@/lib/db";

export default async function AdminSignalsPage() {
  const items = await prisma.signalPost.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <h1 className="editorial text-4xl">Signals</h1>
      {items.length === 0 ? <p className="mt-6 text-muted">No signals. None are invented.</p> : (
        <ul className="mt-8 space-y-4">
          {items.map((item) => (
            <li key={item.id} className="border border-rule p-4">
              <p className="text-sm text-muted">{item.type} · {item.locale}</p>
              <p className="mt-2">{item.body}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
