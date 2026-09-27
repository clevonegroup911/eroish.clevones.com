import { describe, expect, it } from "vitest";
import type { AskSource } from "@prisma/client";

import { retrieveFromApprovedSources, tokenize } from "@/lib/ask-ejc";

function source(partial: Partial<AskSource> & Pick<AskSource, "slug" | "bodyEn" | "titleEn">): AskSource {
  return {
    id: partial.id ?? partial.slug,
    slug: partial.slug,
    titleEn: partial.titleEn,
    titleFr: partial.titleFr ?? partial.titleEn,
    bodyEn: partial.bodyEn,
    bodyFr: partial.bodyFr ?? partial.bodyEn,
    canonicalUrl: partial.canonicalUrl ?? "/en/identity",
    tags: partial.tags ?? "",
    approved: partial.approved ?? true,
    publishState: partial.publishState ?? "PUBLISHED",
    verification: partial.verification ?? "VERIFIED",
    exampleFlag: partial.exampleFlag ?? "LIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("tokenize", () => {
  it("drops stop words", () => {
    expect(tokenize("Where was he born?")).toContain("born");
    expect(tokenize("Where was he born?")).not.toContain("was");
  });
});

describe("retrieveFromApprovedSources", () => {
  const sources = [
    source({
      slug: "origin",
      titleEn: "Confirmed origin",
      bodyEn: "Born in Kinshasa on 1 September 1994.",
      tags: "kinshasa born 1994",
    }),
  ];

  it("answers from an approved source and cites it", () => {
    const answer = retrieveFromApprovedSources({
      query: "Where was EJC born?",
      locale: "EN",
      sources,
      refusalText: "not established",
    });
    expect(answer.kind).toBe("answer");
    if (answer.kind === "answer") {
      expect(answer.text).toMatch(/Kinshasa/);
      expect(answer.citations[0]?.slug).toBe("origin");
    }
  });

  it("refuses when no source covers the question", () => {
    const answer = retrieveFromApprovedSources({
      query: "What is his net worth and private phone number?",
      locale: "EN",
      sources,
      refusalText: "not established",
    });
    expect(answer).toEqual({ kind: "refusal", text: "not established", citations: [] });
  });

  it("ignores unapproved sources", () => {
    const answer = retrieveFromApprovedSources({
      query: "secret fortune",
      locale: "EN",
      sources: [
        source({
          slug: "fake",
          titleEn: "secret fortune",
          bodyEn: "Invented wealth",
          approved: false,
          tags: "secret fortune",
        }),
      ],
      refusalText: "not established",
    });
    expect(answer.kind).toBe("refusal");
  });
});
