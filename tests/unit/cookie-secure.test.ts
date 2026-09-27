import { describe, expect, it } from "vitest";

import { shouldSetSecureCookie } from "@/lib/auth-cookie";

describe("shouldSetSecureCookie", () => {
  it("is Secure in production behind https X-Forwarded-Proto", () => {
    expect(
      shouldSetSecureCookie({
        nodeEnv: "production",
        forwardedProto: "https",
        publicOrigin: "http://127.0.0.1:3001",
      }),
    ).toBe(true);
  });

  it("is Secure in production when APP_ORIGIN is https", () => {
    expect(
      shouldSetSecureCookie({
        nodeEnv: "production",
        forwardedProto: "http",
        publicOrigin: "https://eroish.clevones.com",
      }),
    ).toBe(true);
  });

  it("is Secure in production when COOKIE_SECURE overrides on", () => {
    expect(
      shouldSetSecureCookie({
        nodeEnv: "production",
        forwardedProto: "http",
        cookieSecure: "1",
        publicOrigin: "http://127.0.0.1:3001",
      }),
    ).toBe(true);
  });

  it("is not Secure on local development http", () => {
    expect(
      shouldSetSecureCookie({
        nodeEnv: "development",
        forwardedProto: "http",
        publicOrigin: "http://127.0.0.1:3000",
      }),
    ).toBe(false);
  });

  it("is not Secure in development even with https proto or https origin", () => {
    expect(
      shouldSetSecureCookie({
        nodeEnv: "development",
        forwardedProto: "https",
        publicOrigin: "https://eroish.clevones.com",
      }),
    ).toBe(false);
  });

  it("COOKIE_SECURE=0 forces the flag off in production https", () => {
    expect(
      shouldSetSecureCookie({
        nodeEnv: "production",
        forwardedProto: "https",
        cookieSecure: "0",
        publicOrigin: "https://eroish.clevones.com",
      }),
    ).toBe(false);
  });

  it("is not Secure in production on plain http without override", () => {
    expect(
      shouldSetSecureCookie({
        nodeEnv: "production",
        forwardedProto: "http",
        publicOrigin: "http://127.0.0.1:3100",
      }),
    ).toBe(false);
  });
});
