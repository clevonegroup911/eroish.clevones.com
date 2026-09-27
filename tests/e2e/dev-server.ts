import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

import { e2eBind, e2eOrigin } from "./origin";

const root = path.resolve(__dirname, "../..");
const bind = e2eBind();
const origin = e2eOrigin();

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db?connection_limit=1&socket_timeout=60",
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
  for (let i = 0; i < 180; i += 1) {
    try {
      const res = await fetch(`${origin}/health`);
      if (res.ok) return;
    } catch {
      // still booting
    }
    await sleep(1000);
  }
  throw new Error("e2e server did not start");
}

async function main() {
  await run("npx", ["prisma", "db", "push", "--skip-generate"]);
  await run("npx", ["tsx", "prisma/seed.ts"]);

  const useStart = existsSync(path.join(root, ".next/BUILD_ID"));
  const child = spawn(
    "npx",
    useStart
      ? ["next", "start", "-H", bind.host, "-p", bind.port]
      : ["next", "dev", "-H", bind.host, "-p", bind.port],
    { cwd: root, env, stdio: "inherit" },
  );

  child.on("exit", (code) => {
    process.exit(code ?? 1);
  });

  await waitUntilListening();
}

void main();
