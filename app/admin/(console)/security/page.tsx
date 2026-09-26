import { prisma } from "@/lib/db";

export default async function AdminSecurityPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  const revisions = await prisma.contentRevision.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  return (
    <>
      <h1 className="editorial text-4xl">Security & corrections</h1>
      <h2 className="editorial mt-8 text-2xl">Audit log</h2>
      <ol className="mt-4 space-y-2 text-sm">
        {logs.map((row) => (
          <li key={row.id}>
            {row.createdAt.toISOString()} — {row.action} — {row.entity} — {row.summary}
          </li>
        ))}
      </ol>
      <h2 className="editorial mt-10 text-2xl">Revision history</h2>
      <ol className="mt-4 space-y-2 text-sm">
        {revisions.map((row) => (
          <li key={row.id}>
            {row.createdAt.toISOString()} — {row.entity} v{row.version} — {row.note}
          </li>
        ))}
      </ol>
    </>
  );
}
