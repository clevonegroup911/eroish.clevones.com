import { NextResponse } from "next/server";

import { writeAudit } from "@/lib/audit";
import { connectSchema, hashIp, isHoneypotTriggered } from "@/lib/connect";
import { prisma } from "@/lib/db";
import { consumeRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const limited = await consumeRateLimit({
    key: `connect:${ip}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const parsed = connectSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (isHoneypotTriggered(parsed.data.website)) {
    return NextResponse.json({ ok: true });
  }

  const created = await prisma.connectRequest.create({
    data: {
      intent: parsed.data.intent,
      name: parsed.data.name,
      organization: parsed.data.organization,
      email: parsed.data.email,
      reason: parsed.data.reason,
      context: parsed.data.context,
      whyEjc: parsed.data.whyEjc,
      requestedAction: parsed.data.requestedAction,
      supporting: parsed.data.supporting ?? "",
      ipHash: hashIp(ip, process.env.AUTH_SECRET ?? "dev"),
    },
  });

  await prisma.analyticsEvent.create({
    data: {
      name: "connect_submit",
      path: "/connect",
      meta: JSON.stringify({ intent: parsed.data.intent }),
    },
  });

  await writeAudit({
    action: "CONNECT_RECEIVED",
    entity: "ConnectRequest",
    entityId: created.id,
    summary: `Intent ${parsed.data.intent} from ${parsed.data.organization}`,
  });

  return NextResponse.json({ ok: true, id: created.id });
}
