import { describe, expect, it } from "vitest";

import { OPEN_REDIRECT_PROBES, safeRelativePath } from "@/lib/safe-relative-path";

describe("safeRelativePath", () => {
  it("allows same-origin paths and query strings", () => {
    expect(safeRelativePath("/admin/login?next=%2Fadmin")).toBe("/admin/login?next=%2Fadmin");
    expect(safeRelativePath("/fr/now")).toBe("/fr/now");
    expect(safeRelativePath("/admin/ledger?x=1&y=2")).toBe("/admin/ledger?x=1&y=2");
  });

  it("rejects the twelve open-redirect probes", () => {
    expect(OPEN_REDIRECT_PROBES).toHaveLength(12);
    for (const probe of OPEN_REDIRECT_PROBES) {
      expect(safeRelativePath(probe), probe).toBe("/");
    }
  });

  it("rejects open redirects and prefixed paths", () => {
    expect(safeRelativePath("//evil.example")).toBe("/");
    expect(safeRelativePath("https://evil.example")).toBe("/");
    expect(safeRelativePath("\\evil")).toBe("/");
    expect(safeRelativePath("")).toBe("/");
    expect(safeRelativePath(" /evil.example")).toBe("/");
    expect(safeRelativePath("\t/evil.example")).toBe("/");
    expect(safeRelativePath("%09/evil.example")).toBe("/");
    expect(safeRelativePath("/\tevil.example")).toBe("/");
    expect(safeRelativePath("/evil example")).toBe("/");
    expect(safeRelativePath("/ok\\no")).toBe("/");
    expect(safeRelativePath("/%09evil")).toBe("/");
    expect(safeRelativePath("/%0d%0aLocation:%20https://evil.example")).toBe("/");
  });
});
