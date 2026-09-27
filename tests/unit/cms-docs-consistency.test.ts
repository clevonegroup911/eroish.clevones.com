import { describe, expect, it } from "vitest";

import {
  CANONICAL,
  CMS_DOC_FILES,
  REQUIRED_PHASES,
  REQUIRED_SECTIONS,
  checkCmsDocs,
  hasExactToken,
  mermaidFenceErrors,
  parseCanonical,
  parseRbacMatrix,
  parseTransitions,
  readCmsDoc,
} from "../../scripts/check-cms-docs";

describe("CMS-01 architecture docs consistency", () => {
  const result = checkCmsDocs();

  it("finds all five CMS docs with matching canonical tokens", () => {
    expect(result.errors, result.errors.join("\n")).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("lists the 18 required section headings and 12 phases", () => {
    expect(REQUIRED_SECTIONS).toHaveLength(18);
    expect(REQUIRED_PHASES).toHaveLength(12);
    expect(CMS_DOC_FILES).toHaveLength(5);
    expect(CANONICAL.roles).toEqual([
      "SUPER_ADMIN",
      "ADMIN",
      "EDITOR",
      "AUTHOR",
      "REVIEWER",
      "MEDIA_MANAGER",
    ]);
    expect(CANONICAL.capabilities).toContain("content.verify");
    expect(CANONICAL.workflow).toEqual([
      "DRAFT",
      "IN_REVIEW",
      "APPROVED",
      "SCHEDULED",
      "PUBLISHED",
      "UNPUBLISHED",
      "ARCHIVED",
    ]);
  });

  it("parses identical cms-canonical blocks from every file", () => {
    const parsed = CMS_DOC_FILES.map((file) => parseCanonical(readCmsDoc(file)));
    expect(parsed.every(Boolean)).toBe(true);
    const first = JSON.stringify(parsed[0]);
    for (const block of parsed) {
      expect(JSON.stringify(block)).toBe(first);
    }
  });

  it("matches role tokens exactly so ADMIN is not SUPER_ADMIN", () => {
    expect(hasExactToken("SUPER_ADMIN", "ADMIN")).toBe(false);
    expect(hasExactToken("role ADMIN may", "ADMIN")).toBe(true);
    expect(hasExactToken("content.verify required", "content.verify")).toBe(true);
  });

  it("cross-checks RBAC matrix capabilities against workflow transitions", () => {
    const security = readCmsDoc("docs/CMS-SECURITY.md");
    const plan = readCmsDoc("docs/CMS-IMPLEMENTATION-PLAN.md");
    const matrix = parseRbacMatrix(security);
    const transitions = parseTransitions(plan);
    expect(matrix).not.toBeNull();
    expect(transitions.length).toBeGreaterThan(0);
    expect(matrix?.SUPER_ADMIN).toContain("content.verify");
    expect(matrix?.ADMIN).not.toContain("content.verify");
    for (const edge of transitions) {
      expect(CANONICAL.capabilities, edge.capability).toContain(edge.capability);
      const holders = Object.values(matrix ?? {}).some((caps) => caps.includes(edge.capability));
      expect(holders, `${edge.from}->${edge.to} ${edge.capability}`).toBe(true);
    }
  });

  it("requires mermaid fences to be closed", () => {
    expect(mermaidFenceErrors("```mermaid\nflowchart LR\n  A --> B\n```", "ok.md")).toEqual([]);
    expect(mermaidFenceErrors("```mermaid\nflowchart LR\n", "bad.md").length).toBeGreaterThan(0);
  });
});
