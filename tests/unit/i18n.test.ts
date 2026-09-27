import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getDictionary } from "@/lib/i18n";

const FORBIDDEN = [
  "BUILD. LEAD. EXECUTE",
  "Build the man",
  "Construire l’homme",
  "My word has a history",
  "Ma parole a une histoire",
  "BUILD → ACT → PROVE",
  "Build → Act → Prove",
  "Construire → Agir → Prouver",
  "SIGNAL → UNDERSTANDING",
  "ACTION → EXECUTION → EVIDENCE",
];

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "test-results",
  "playwright-report",
  "output",
  "tests",
]);

function walkSources(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...walkSources(full));
      continue;
    }
    if (/\.(ts|tsx|md|json)$/.test(name) && !full.endsWith("tests/unit/i18n.test.ts")) {
      out.push(full);
    }
  }
  return out;
}

describe("public copy", () => {
  it("does not assign a personal motto or the removed command line", () => {
    for (const locale of ["en", "fr"] as const) {
      const blob = JSON.stringify(getDictionary(locale));
      for (const phrase of FORBIDDEN) {
        expect(blob).not.toContain(phrase);
      }
      expect(getDictionary(locale).footer).not.toHaveProperty("cycle");
      expect(getDictionary(locale).ledger).not.toHaveProperty("motto");
    }
  });

  it("keeps forbidden slogans out of UI, metadata, seed, and docs", () => {
    const root = path.resolve(__dirname, "../..");
    for (const file of walkSources(root)) {
      const text = readFileSync(file, "utf8");
      for (const phrase of FORBIDDEN) {
        expect(text, path.relative(root, file)).not.toContain(phrase);
      }
    }
  });

  it("states the multicultural fact without naming other places", () => {
    expect(getDictionary("en").home.multicultural).toMatch(
      /Grew up and lived across different countries, cities and provinces/,
    );
    expect(getDictionary("fr").home.multicultural).toMatch(
      /grandi et vécu dans différents pays, villes et provinces/,
    );
    expect(getDictionary("fr").home.multicultural).toMatch(/multiculturel/);
    expect(getDictionary("fr").home.multicultural).not.toMatch(/fait multicultural/);
    expect(getDictionary("en").places.lead).not.toMatch(/Lubumbashi|Paris|London|Brussels/i);
  });
});
