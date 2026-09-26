import type { AskSource, Locale } from "@prisma/client";

export type AskCitation = {
  slug: string;
  title: string;
  url: string;
};

export type AskAnswer =
  | {
      kind: "answer";
      text: string;
      citations: AskCitation[];
    }
  | {
      kind: "refusal";
      text: string;
      citations: [];
    };

const STOP = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "for",
  "is",
  "are",
  "was",
  "what",
  "who",
  "where",
  "when",
  "how",
  "does",
  "did",
  "le",
  "la",
  "les",
  "un",
  "une",
  "des",
  "et",
  "ou",
  "de",
  "du",
  "en",
  "est",
  "qui",
  "que",
  "quoi",
  "comment",
  "où",
]);

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP.has(token));
}

export function scoreSource(tokens: string[], haystack: string): number {
  if (!tokens.length) return 0;
  const hay = haystack.toLowerCase();
  let hits = 0;
  for (const token of tokens) {
    if (hay.includes(token)) hits += 1;
  }
  return hits / tokens.length;
}

export function retrieveFromApprovedSources(input: {
  query: string;
  locale: Locale;
  sources: AskSource[];
  refusalText: string;
}): AskAnswer {
  const approved = input.sources.filter((source) => source.approved);
  const tokens = tokenize(input.query);

  if (!tokens.length || !approved.length) {
    return { kind: "refusal", text: input.refusalText, citations: [] };
  }

  const ranked = approved
    .map((source) => {
      const body = input.locale === "FR" ? source.bodyFr : source.bodyEn;
      const title = input.locale === "FR" ? source.titleFr : source.titleEn;
      const haystack = `${title} ${body} ${source.tags}`;
      return { source, score: scoreSource(tokens, haystack), title, body };
    })
    .filter((row) => row.score >= 0.34)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (!ranked.length) {
    return { kind: "refusal", text: input.refusalText, citations: [] };
  }

  const primary = ranked[0];
  if (!primary) {
    return { kind: "refusal", text: input.refusalText, citations: [] };
  }

  return {
    kind: "answer",
    text: primary.body,
    citations: ranked.map((row) => ({
      slug: row.source.slug,
      title: row.title,
      url: row.source.canonicalUrl,
    })),
  };
}
