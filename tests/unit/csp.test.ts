import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { buildCsp, nonceFromCsp } from "@/lib/csp";

describe("csp nonce", () => {
  it("reads the script nonce from a CSP header", () => {
    const csp = buildCsp("abc-123", false);
    expect(nonceFromCsp(csp)).toBe("abc-123");
    expect(nonceFromCsp(null)).toBeUndefined();
  });

  it("does not set an x-nonce request header in middleware", () => {
    const source = readFileSync(path.resolve(__dirname, "../../middleware.ts"), "utf8");
    expect(source).not.toMatch(/requestHeaders\.set\(\s*["']x-nonce["']/);
  });
});
