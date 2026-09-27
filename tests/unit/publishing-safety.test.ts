import { describe, expect, it } from "vitest";

import { containsSensitiveContent, publishingSafetyCheck } from "@/lib/publishing-safety";

describe("publishingSafetyCheck", () => {
  it("allows non-published drafts regardless of verification", () => {
    expect(
      publishingSafetyCheck({
        publishState: "DRAFT",
        verification: "NEEDS_CONFIRMATION",
        sources: [],
        exampleFlag: "EXAMPLE",
      }),
    ).toEqual({ ok: true });
  });

  it("blocks publishing unverified items", () => {
    const result = publishingSafetyCheck({
      publishState: "PUBLISHED",
      verification: "NEEDS_CONFIRMATION",
      sources: [{ label: "note" }],
      exampleFlag: "LIVE",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reasons).toContain("unverified-as-fact");
  });

  it("blocks publishing without a source", () => {
    const result = publishingSafetyCheck({
      publishState: "PUBLISHED",
      verification: "VERIFIED",
      sources: [],
      exampleFlag: "LIVE",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reasons).toContain("missing-source");
  });

  it("blocks example data from going live as fact", () => {
    const result = publishingSafetyCheck({
      publishState: "PUBLISHED",
      verification: "VERIFIED",
      sources: [{ label: "mandate" }],
      exampleFlag: "EXAMPLE",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reasons).toContain("example-data-cannot-publish-as-fact");
  });

  it("allows verified sourced live facts", () => {
    expect(
      publishingSafetyCheck({
        publishState: "PUBLISHED",
        verification: "VERIFIED",
        sources: [{ label: "mandate", url: "/docs/CONTENT-NEEDED.md" }],
        exampleFlag: "LIVE",
      }),
    ).toEqual({ ok: true });
  });
});

describe("containsSensitiveContent", () => {
  it("flags secrets and account numbers", () => {
    expect(containsSensitiveContent("here is an api_key value")).toBe(true);
    expect(containsSensitiveContent("IBAN listed")).toBe(true);
    expect(containsSensitiveContent("Born in Kinshasa")).toBe(false);
  });
});
