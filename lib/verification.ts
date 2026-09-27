import type { PublishState, VerificationStatus } from "@prisma/client";

export const FACTUAL_STATUSES: VerificationStatus[] = ["VERIFIED", "DOCUMENTED", "CORRECTED", "UPDATED"];

export const UNVERIFIED_AS_FACT: VerificationStatus[] = [
  "NEEDS_CONFIRMATION",
  "DECLARED",
  "IN_PROGRESS",
];

export function isUnverifiedAsFact(status: VerificationStatus): boolean {
  return UNVERIFIED_AS_FACT.includes(status);
}

export function statusLabel(status: VerificationStatus, locale: "en" | "fr"): string {
  const map: Record<VerificationStatus, { en: string; fr: string }> = {
    VERIFIED: { en: "Verified", fr: "Vérifié" },
    DOCUMENTED: { en: "Documented", fr: "Documenté" },
    DECLARED: { en: "Declared", fr: "Déclaré" },
    IN_PROGRESS: { en: "In progress", fr: "En cours" },
    UPDATED: { en: "Updated", fr: "Mis à jour" },
    CORRECTED: { en: "Corrected", fr: "Corrigé" },
    NEEDS_CONFIRMATION: { en: "Needs confirmation", fr: "À confirmer" },
  };
  return map[status][locale];
}

export function canAppearPublic(publishState: PublishState): boolean {
  return publishState === "PUBLISHED";
}

export type SourceLike = { label: string; url?: string | null };

export type PublishCandidate = {
  publishState: PublishState;
  verification: VerificationStatus;
  sources: SourceLike[];
  exampleFlag?: "LIVE" | "EXAMPLE";
};

export type SafetyResult =
  | { ok: true }
  | { ok: false; reasons: string[] };

/**
 * Public items may not be published if they are unverified-as-fact
 * or lack at least one source. Example-flagged items also cannot go live.
 */
export function publishingSafetyCheck(item: PublishCandidate): SafetyResult {
  if (item.publishState !== "PUBLISHED") {
    return { ok: true };
  }

  const reasons: string[] = [];

  if (isUnverifiedAsFact(item.verification)) {
    reasons.push("unverified-as-fact");
  }

  if (!item.sources.length) {
    reasons.push("missing-source");
  }

  if (item.exampleFlag === "EXAMPLE") {
    reasons.push("example-data-cannot-publish-as-fact");
  }

  if (reasons.length) {
    return { ok: false, reasons };
  }

  return { ok: true };
}

export function sensitiveFieldPatterns(): RegExp[] {
  return [
    /\b(?:iban|swift|bic)\b/i,
    /\b(?:password|passwd|secret|api[_-]?key)\b/i,
    /\b(?:passport|national id|carte d['’]identit)/i,
    /\b(?:ssn|social security)\b/i,
    /\b(?:account number|num[eé]ro de compte)\b/i,
  ];
}

export function containsSensitiveContent(text: string): boolean {
  return sensitiveFieldPatterns().some((pattern) => pattern.test(text));
}
