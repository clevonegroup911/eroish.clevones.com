import { requireAdmin } from "@/lib/admin/session";
import { prisma } from "@/lib/db";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const grouped = await prisma.analyticsEvent.groupBy({
    by: ["name"],
    _count: { name: true },
  });
  return (
    <>
      <h1 className="editorial text-4xl">Analytics</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        First-party, privacy-conscious counts. Optimized for trust and qualified interaction — not
        vanity clicks. No fake visitor counters.
      </p>
      <ul className="mt-8 space-y-2">
        {grouped.map((row) => (
          <li key={row.name} className="flex justify-between border-b border-rule py-2">
            <span>{row.name}</span>
            <span>{row._count.name}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
