import { describe, expect, it } from "vitest";

import { isMeaningfulEngagement, proposalFromSignals } from "@/lib/learning";

describe("learning engine", () => {
  it("treats verification and refusals as meaningful", () => {
    expect(isMeaningfulEngagement("ask_refusal")).toBe(true);
    expect(isMeaningfulEngagement("page_view")).toBe(false);
  });

  it("proposes a sourced gap instead of inventing an answer", () => {
    const proposal = proposalFromSignals([{ name: "ask_refusal", count: 4 }]);
    expect(proposal?.recommendation).toMatch(/Do not auto-publish/i);
  });

  it("does not invent a proposal from noise", () => {
    expect(proposalFromSignals([{ name: "explore_open", count: 1 }])).toBeNull();
  });
});
