import { NextResponse } from "next/server";
import { z } from "zod";

import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { consumeRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  slug: z.string().min(1),
  kind: z.enum(["QUESTION", "CHALLENGE", "EVIDENCE", "COUNTERARGUMENT"]),
  name: z.string().trim().min(2).max(120),
  organization: z.string().trim().max(160).optional().default(""),
  body: z.string().trim().min(8).max(4000),
});

export async function POST(request: Request) {
  const limited = await consumeRateLimit({
    key: `challenge:${request.headers.get("x-forwarded-for") ?? "local"}`,
    limit: 8,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const thesis = await prisma.thesis.findFirst({
    where: { slug: parsed.data.slug, open: true, publishState: { in: ["PUBLISHED", "REVIEW"] } },
  });
  if (!thesis) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const created = await prisma.challengeEntry.create({
    data: {
      thesisId: thesis.id,
      kind: parsed.data.kind,
      name: parsed.data.name,
      organization: parsed.data.organization || null,
      body: parsed.data.body,
      moderation: "PENDING",
    },
  });

  await prisma.analyticsEvent.create({
    data: {
      name: "challenge_submit",
      path: `/challenge/${thesis.slug}`,
      meta: JSON.stringify({ kind: parsed.data.kind }),
    },
  });

  await writeAudit({
    action: "CHALLENGE_RECEIVED",
    entity: "ChallengeEntry",
    entityId: created.id,
    summary: `Pending ${parsed.data.kind} on ${thesis.slug}`,
  });

  return NextResponse.json({ ok: true });
}
