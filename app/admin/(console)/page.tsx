import Link from "next/link";

import { requireAdmin } from "@/lib/admin/session";
import { prisma } from "@/lib/db";

export default async function AdminHomePage() {
  await requireAdmin();
  const [
    nowCount,
    recordCount,
    proofCount,
    connectCount,
    challengeCount,
    proposals,
    latestAudit,
  ] = await Promise.all([
    prisma.nowItem.count(),
    prisma.recordEvent.count(),
    prisma.proofItem.count(),
    prisma.connectRequest.count({ where: { status: "NEW" } }),
    prisma.challengeEntry.count({ where: { moderation: "PENDING" } }),
    prisma.learningProposal.count({ where: { status: "PROPOSED" } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const cards = [
    ["Now items", nowCount, "/admin/now"],
    ["Record events", recordCount, "/admin/record"],
    ["Proofs", proofCount, "/admin/proofs"],
    ["New connect requests", connectCount, "/admin/connect"],
    ["Pending challenges", challengeCount, "/admin/challenges"],
    ["Learning proposals", proposals, "/admin/learning"],
  ] as const;

  return (
    <>
      <h1 className="editorial text-4xl">Command center</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Publish only verified, sourced facts. High-risk or unverified items stay in review. The
        Learning Engine cannot rewrite identity without approval.
      </p>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {cards.map(([label, count, href]) => (
          <li key={href} className="border border-rule p-5">
            <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">{label}</p>
            <p className="editorial mt-2 text-4xl">{count}</p>
            <Link href={href} className="mt-3 inline-block text-sm underline">
              Open
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="editorial mt-12 text-2xl">Recent audit</h2>
      <ol className="mt-4 space-y-2 text-sm">
        {latestAudit.map((row) => (
          <li key={row.id}>
            {row.createdAt.toISOString()} — {row.action} — {row.summary}
          </li>
        ))}
      </ol>
    </>
  );
}
