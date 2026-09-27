import { describe, expect, it } from "vitest";

import { buildRedirectLocation } from "@/lib/request-redirect";

describe("buildRedirectLocation", () => {
  it("keeps a loopback request host instead of baking localhost", () => {
    expect(
      buildRedirectLocation({
        pathname: "/admin/login",
        search: "?next=%2Fadmin",
        host: "127.0.0.1:3002",
        protocol: "http:",
        appOrigin: "http://127.0.0.1:3000",
      }),
    ).toBe("http://127.0.0.1:3002/admin/login?next=%2Fadmin");
  });

  it("uses APP_ORIGIN for non-loopback hosts", () => {
    expect(
      buildRedirectLocation({
        pathname: "/fr",
        host: "eroish.clevones.com",
        protocol: "http:",
        appOrigin: "https://eroish.clevones.com",
      }),
    ).toBe("https://eroish.clevones.com/fr");
  });
});
