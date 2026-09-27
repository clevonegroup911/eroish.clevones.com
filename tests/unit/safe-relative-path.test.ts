import { describe, expect, it } from "vitest";

import { safeRelativePath } from "@/lib/safe-relative-path";

describe("safeRelativePath", () => {
  it("allows same-origin paths and query strings", () => {
    expect(safeRelativePath("/admin/login?next=%2Fadmin")).toBe("/admin/login?next=%2Fadmin");
    expect(safeRelativePath("/fr/now")).toBe("/fr/now");
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
  });
});
