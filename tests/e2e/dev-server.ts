import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../..");
const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db",
  AUTH_SECRET: process.env.AUTH_SECRET ?? "dev-only-auth-secret-change-before-production-use-32b",
  APP_ORIGIN: process.env.APP_ORIGIN ?? "http://127.0.0.1:3000",
  ADMIN_BOOTSTRAP_EMAIL: process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@localhost",
  ADMIN_BOOTSTRAP_PASSWORD: process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "change-this-admin-password",
  PORT: process.env.PORT ?? "3000",
  HOSTNAME: "127.0.0.1",
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

async function main() {
  await run("npx", ["prisma", "db", "push", "--skip-generate"]);
  await run("npx", ["tsx", "prisma/seed.ts"]);

  const useStart = existsSync(path.join(root, ".next"));
  const child = spawn("npx", useStart ? ["next", "start", "-H", "127.0.0.1", "-p", "3000"] : ["next", "dev", "-H", "127.0.0.1", "-p", "3000"], {
    cwd: root,
    env,
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    process.exit(code ?? 1);
  });
}

void main();
