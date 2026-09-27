import { existsSync } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

export function GET() {
  if (process.env.E2E_WARMUP === "1") {
    const marker = path.join(process.cwd(), ".e2e-warm");
    if (!existsSync(marker)) {
      return new Response("warming", { status: 503 });
    }
  }
  return Response.json({ ok: true, service: "eroish.clevones.com" });
}
