import { describe, expect, it } from "vitest";

import { isMetadataPath } from "@/lib/auth-cookie";

describe("isMetadataPath", () => {
  it("exempts icon and related metadata routes", () => {
    expect(isMetadataPath("/icon")).toBe(true);
    expect(isMetadataPath("/icon?size=32")).toBe(true);
    expect(isMetadataPath("/apple-icon")).toBe(true);
    expect(isMetadataPath("/opengraph-image")).toBe(true);
    expect(isMetadataPath("/twitter-image")).toBe(true);
    expect(isMetadataPath("/manifest.webmanifest")).toBe(true);
    expect(isMetadataPath("/en/icon")).toBe(true);
  });

  it("does not treat ordinary pages as metadata", () => {
    expect(isMetadataPath("/en")).toBe(false);
    expect(isMetadataPath("/fr/identity")).toBe(false);
    expect(isMetadataPath("/admin")).toBe(false);
  });
});
