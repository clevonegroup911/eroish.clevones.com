import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

export function artifactsDir(): string {
  return process.env.E2E_ARTIFACTS_DIR ?? path.join(process.cwd(), "tests/e2e/output");
}

export async function shot(page: Page, name: string) {
  const dir = artifactsDir();
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true });
}
