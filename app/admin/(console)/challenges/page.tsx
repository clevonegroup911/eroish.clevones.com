import { moderateChallenge } from "@/app/admin/actions";
import { prisma } from "@/lib/db";

export default async function AdminChallengesPage() {
  const theses = await prisma.thesis.findMany({ include: { challenges: true } });
  return (
    <>
      <h1 className="editorial text-4xl">Challenges</h1>
      {theses.map((thesis) => (
        <section key={thesis.id} className="mt-8 border border-rule p-4">
          <h2 className="text-xl">{thesis.titleEn}</h2>
          <p className="text-sm text-muted">v{thesis.version} · {thesis.publishState}</p>
          <ul className="mt-4 space-y-3">
            {thesis.challenges.map((entry) => (
              <li key={entry.id} className="border border-rule p-3">
                <p className="text-sm text-muted">{entry.kind} · {entry.moderation} · {entry.name}</p>
                <p className="mt-2">{entry.body}</p>
                <div className="mt-3 flex gap-2">
                  <form action={moderateChallenge.bind(null, entry.id, "APPROVED")}>
                    <button className="border px-2 py-1 text-xs uppercase">Approve</button>
                  </form>
                  <form action={moderateChallenge.bind(null, entry.id, "REJECTED")}>
                    <button className="border px-2 py-1 text-xs uppercase">Reject</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
