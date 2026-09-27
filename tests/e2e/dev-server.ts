import { spawn } from "node:child_process";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

import { e2eBind, e2eOrigin } from "./origin";

const root = path.resolve(__dirname, "../..");
const bind = e2eBind();
const origin = e2eOrigin();
const warmMarker = path.join(root, ".e2e-warm");

const WARMUP = [
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

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db",
  AUTH_SECRET: process.env.AUTH_SECRET ?? "dev-only-auth-secret-change-before-production-use-32b",
  APP_ORIGIN: origin,
  SITE_URL: process.env.SITE_URL ?? "https://eroish.clevones.com",
  ADMIN_BOOTSTRAP_EMAIL: process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@localhost",
  ADMIN_BOOTSTRAP_PASSWORD: process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "change-this-admin-password",
  PORT: bind.port,
  HOSTNAME: bind.host,
};

async function run(command: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, env, stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
  });
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitUntilListening() {
  for (let i = 0; i < 90; i += 1) {
    try {
      const res = await fetch(`${origin}/health`);
      if (res.status === 503 || res.ok) return;
    } catch {
      // still booting
    }
    await sleep(1000);
  }
  throw new Error("e2e server did not start");
}

const COMPILE_ERROR =
  /Unexpected end of JSON|InvariantError|Runtime SyntaxError|Failed to generate static paths|clientReferenceManifest/i;

async function warmRoute(route: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    try {
      const res = await fetch(`${origin}${route}`);
      const body = await res.text();
      const usable = res.ok || (res.status >= 300 && res.status < 400);
      if (usable && !COMPILE_ERROR.test(body)) return;
    } catch {
      // retry while Next compiles
    }
    await sleep(1000);
  }
}

async function warmup() {
  for (let pass = 0; pass < 2; pass += 1) {
    for (const route of WARMUP) {
      await warmRoute(route);
    }
  }
}

async function main() {
  if (existsSync(warmMarker)) unlinkSync(warmMarker);
  await run("npx", ["prisma", "db", "push", "--skip-generate"]);
  await run("npx", ["tsx", "prisma/seed.ts"]);

  const useStart = existsSync(path.join(root, ".next/BUILD_ID"));
  const childEnv = useStart ? env : { ...env, E2E_WARMUP: "1" };
  const child = spawn(
    "npx",
    useStart
      ? ["next", "start", "-H", bind.host, "-p", bind.port]
      : ["next", "dev", "-H", bind.host, "-p", bind.port],
    { cwd: root, env: childEnv, stdio: "inherit" },
  );

  child.on("exit", (code) => {
    if (existsSync(warmMarker)) unlinkSync(warmMarker);
    process.exit(code ?? 1);
  });

  await waitUntilListening();
  if (!useStart) {
    await warmup();
  }
  writeFileSync(warmMarker, "ok");
}

void main();
