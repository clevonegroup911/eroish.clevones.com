import { e2eOrigin } from "./origin";

const WARMUP = [
  "/health",
  "/en",
  "/fr",
  "/en/journey",
  "/en/places",
  "/en/now",
  "/en/record",
  "/en/proof",
  "/en/ask",
  "/en/connect",
  "/en/ledger",
  "/fr/now",
  "/fr/identity",
  "/fr/journey",
  "/fr/places",
  "/fr/connect",
  "/admin/login",
  "/icon",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

const COMPILE_ERROR =
  /Unexpected end of JSON|InvariantError|Runtime SyntaxError|Failed to generate static paths|clientReferenceManifest/i;

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function warmRoute(origin: string, route: string) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const res = await fetch(`${origin}${route}`);
      const body = await res.text();
      const usable = res.ok || (res.status >= 300 && res.status < 400);
      if (usable && !COMPILE_ERROR.test(body)) return;
    } catch {
      // first compile can fail on a slow disk
    }
    await sleep(750);
  }
}

export default async function globalSetup() {
  const origin = e2eOrigin();
  for (const route of WARMUP) {
    await warmRoute(origin, route);
  }
}
