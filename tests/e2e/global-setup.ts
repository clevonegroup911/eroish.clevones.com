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
  "/fr/ledger",
  "/admin/login",
  "/icon",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

export default async function globalSetup() {
  const origin = e2eOrigin();
  for (const route of WARMUP) {
    try {
      await fetch(`${origin}${route}`);
    } catch {
      // Compilation errors on first hit are retried by the tests.
    }
  }
}
