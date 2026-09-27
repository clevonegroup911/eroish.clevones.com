import { readFileSync } from "node:fs";
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
];

const PUBLIC_SOURCES = [
  "lib/i18n.ts",
  "lib/identity.ts",
  "prisma/seed.ts",
  "app/[locale]/page.tsx",
  "app/[locale]/ledger/page.tsx",
  "app/[locale]/principles/page.tsx",
];

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

  it("keeps forbidden slogans out of public source files", () => {
    for (const file of PUBLIC_SOURCES) {
      const text = readFileSync(file, "utf8");
      for (const phrase of FORBIDDEN) {
        expect(text, file).not.toContain(phrase);
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
