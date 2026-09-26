import { describe, expect, it } from "vitest";

import { plural } from "@/lib/plural";

describe("plural", () => {
  it("uses the singular form for one", () => {
    expect(plural(1, { one: "confirmed place", other: "confirmed places" })).toBe(
      "1 confirmed place",
    );
    expect(plural(1, { one: "lieu confirmé", other: "lieux confirmés" })).toBe("1 lieu confirmé");
  });

  it("uses the other form for zero and many", () => {
    expect(plural(0, { one: "confirmed place", other: "confirmed places" })).toBe(
      "0 confirmed places",
    );
    expect(plural(2, { one: "lieu confirmé", other: "lieux confirmés" })).toBe("2 lieux confirmés");
  });
});
