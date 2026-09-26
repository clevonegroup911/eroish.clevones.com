import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { isMeaningfulEngagement, proposalFromSignals } from "@/lib/learning";

const schema = z.object({
  name: z.string().min(2).max(80),
  path: z.string().max(200).optional().default("/"),
  locale: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  await prisma.analyticsEvent.create({
    data: {
      name: parsed.data.name,
      path: parsed.data.path,
      locale: parsed.data.locale,
      meta: JSON.stringify(parsed.data.meta ?? {}),
    },
  });

  if (isMeaningfulEngagement(parsed.data.name)) {
    const grouped = await prisma.analyticsEvent.groupBy({
      by: ["name"],
      _count: { name: true },
    });
    const proposal = proposalFromSignals(
      grouped.map((row) => ({ name: row.name, count: row._count.name })),
    );
    if (proposal) {
      const existing = await prisma.learningProposal.findFirst({
        where: { title: proposal.title, status: "PROPOSED" },
      });
      if (!existing) {
        await prisma.learningProposal.create({
          data: proposal,
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
