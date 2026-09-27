import { describe, expect, it } from "vitest";

import {
  CANONICAL,
  CMS_DOC_FILES,
  REQUIRED_PHASES,
  REQUIRED_SECTIONS,
  checkCmsDocs,
  mermaidFenceErrors,
  parseCanonical,
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

  it("requires mermaid fences to be closed", () => {
    expect(mermaidFenceErrors("```mermaid\nflowchart LR\n  A --> B\n```", "ok.md")).toEqual([]);
    expect(mermaidFenceErrors("```mermaid\nflowchart LR\n", "bad.md").length).toBeGreaterThan(0);
  });
});
