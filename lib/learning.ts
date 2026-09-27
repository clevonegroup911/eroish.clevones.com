export type LearningSignal = {
  name: string;
  path: string;
  locale?: string;
  meta?: Record<string, unknown>;
};

const MEANINGFUL = new Set([
  "explore_open",
  "record_filter",
  "proof_inspect",
  "ask_refusal",
  "ask_answer",
  "connect_submit",
  "challenge_submit",
  "verify_claim",
]);

export function isMeaningfulEngagement(name: string): boolean {
  return MEANINGFUL.has(name);
}

export function proposalFromSignals(signals: { name: string; count: number }[]): {
  title: string;
  rationale: string;
  recommendation: string;
} | null {
  const refusals = signals.find((row) => row.name === "ask_refusal")?.count ?? 0;
  const verifies = signals.find((row) => row.name === "verify_claim")?.count ?? 0;

  if (refusals >= 3) {
    return {
      title: "Clarify a repeated Ask EJC gap",
      rationale: `${refusals} sourced-retrieval refusals indicate a missing approved source, not a need to invent an answer.`,
      recommendation:
        "Draft an approved Ask source only if EJC confirms the fact. Do not auto-publish. Require human approval.",
    };
  }

  if (verifies >= 3) {
    return {
      title: "Strengthen a frequently inspected claim",
      rationale: `${verifies} verification inspections suggest visitors are testing a claim's evidence.`,
      recommendation:
        "Review the Proof Graph item, attach a stronger source if one exists, and keep history. Approval required.",
    };
  }

  return null;
}
