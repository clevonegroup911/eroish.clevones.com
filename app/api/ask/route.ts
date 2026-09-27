import { NextResponse } from "next/server";
import { z } from "@/lib/zod";

import { retrieveFromApprovedSources } from "@/lib/ask-ejc";
import { prisma } from "@/lib/db";
import { getDictionary, isLocale } from "@/lib/i18n";
import { consumeRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  query: z.string().trim().min(2).max(500),
  locale: z.string(),
});

export async function POST(request: Request) {
  const limited = await consumeRateLimit({
    key: `ask:${request.headers.get("x-forwarded-for") ?? "local"}`,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const locale = isLocale(parsed.data.locale) ? parsed.data.locale : "en";
  const dict = getDictionary(locale);
  const sources = await prisma.askSource.findMany({
    where: { approved: true, publishState: "PUBLISHED" },
  });

  const answer = retrieveFromApprovedSources({
    query: parsed.data.query,
    locale: locale === "fr" ? "FR" : "EN",
    sources,
    refusalText: dict.ask.refusal,
  });

  await prisma.analyticsEvent.create({
    data: {
      name: answer.kind === "refusal" ? "ask_refusal" : "ask_answer",
      path: "/ask",
      locale,
      meta: JSON.stringify({ query: parsed.data.query.slice(0, 120) }),
    },
  });

  return NextResponse.json(answer);
}
