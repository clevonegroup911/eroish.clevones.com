import { describe, expect, it } from "vitest";

import { getDictionary } from "@/lib/i18n";

describe("public copy", () => {
  it("does not assign a personal motto or the removed command line", () => {
    for (const locale of ["en", "fr"] as const) {
      const blob = JSON.stringify(getDictionary(locale));
      expect(blob).not.toMatch(/BUILD\. LEAD\. EXECUTE/);
      expect(blob).not.toMatch(/Build the man/);
      expect(blob).not.toMatch(/Construire l’homme/);
      expect(getDictionary(locale).footer).not.toHaveProperty("cycle");
    }
  });

  it("states the multicultural fact without naming other places", () => {
    expect(getDictionary("en").home.multicultural).toMatch(
      /Grew up and lived across different countries, cities and provinces/,
    );
    expect(getDictionary("fr").home.multicultural).toMatch(
      /grandi et vécu dans différents pays, villes et provinces/,
    );
    expect(getDictionary("en").places.lead).not.toMatch(/Lubumbashi|Paris|London|Brussels/i);
  });
});
