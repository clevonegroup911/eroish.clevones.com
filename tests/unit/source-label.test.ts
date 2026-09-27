import { describe, expect, it } from "vitest";

import { getDictionary } from "@/lib/i18n";
import { localizeSourceLabel, MANDATE_SOURCE_KEY } from "@/lib/source-label";

describe("localizeSourceLabel", () => {
  it("maps the mandate key to a human label in both locales", () => {
    expect(localizeSourceLabel(MANDATE_SOURCE_KEY, getDictionary("en"))).toBe(
      "Confirmed public facts for this official identity platform",
    );
    expect(localizeSourceLabel(MANDATE_SOURCE_KEY, getDictionary("fr"))).toBe(
      "Faits publics confirmés pour cette plateforme d’identité officielle",
    );
  });

  it("leaves other labels unchanged", () => {
    expect(localizeSourceLabel("Independent citation", getDictionary("en"))).toBe(
      "Independent citation",
    );
  });
});
