import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
      continue;
    }
    if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

describe("admin auth guards", () => {
  it("calls requireAdmin before Prisma on every console page and action", () => {
    const root = path.resolve(__dirname, "../../app/admin");
    for (const file of walk(root)) {
      const text = readFileSync(file, "utf8");
      if (!text.includes("prisma.")) continue;
      const requireAt = text.indexOf("requireAdmin(");
      const prismaAt = text.search(/prisma\.\w/);
      expect(requireAt, path.relative(root, file)).toBeGreaterThanOrEqual(0);
      expect(requireAt, path.relative(root, file)).toBeLessThan(prismaAt);
    }
  });
});
