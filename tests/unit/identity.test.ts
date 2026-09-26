import { describe, expect, it } from "vitest";

import { CONFIRMED, personJsonLd } from "@/lib/identity";

describe("confirmed identity", () => {
  it("does not invent extra biographical fields", () => {
    expect(CONFIRMED.fullName).toBe("Eroish Clevone Jeamson");
    expect(CONFIRMED.birthPlaceCity).toBe("Kinshasa");
    expect(CONFIRMED.organization).toBe("CLEVONE SARL");
    expect(Object.keys(CONFIRMED)).not.toContain("netWorth");
    expect(Object.keys(CONFIRMED)).not.toContain("awards");
  });

  it("emits a Person graph with only confirmed facts", () => {
    const graph = personJsonLd("https://eroish.clevones.com");
    expect(graph["@type"]).toBe("Person");
    expect(graph.birthDate).toBe("1994-09-01");
    expect(graph.affiliation).toEqual({ "@type": "Organization", name: "CLEVONE SARL" });
    expect(JSON.stringify(graph)).not.toMatch(/award|net.?worth|testimonial/i);
  });
});
