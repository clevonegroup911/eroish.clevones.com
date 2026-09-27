import { existsSync } from "node:fs";

import { e2eWarmMarkerPath } from "@/lib/e2e-warm-path";

export const dynamic = "force-dynamic";

export function GET() {
  if (process.env.E2E_WARMUP === "1") {
    if (!existsSync(e2eWarmMarkerPath())) {
      return new Response("warming", { status: 503 });
    }
  }
  return Response.json({ ok: true, service: "eroish.clevones.com" });
}
