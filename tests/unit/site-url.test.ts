import { afterEach, describe, expect, it } from "vitest";

import { publicSiteUrl } from "@/lib/site-url";

describe("publicSiteUrl", () => {
  const original = process.env.SITE_URL;

  afterEach(() => {
    if (original === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = original;
  });

  it("defaults to the canonical public origin", () => {
    delete process.env.SITE_URL;
    expect(publicSiteUrl()).toBe("https://eroish.clevones.com");
  });

  it("uses SITE_URL when set", () => {
    process.env.SITE_URL = "https://example.test/path";
    expect(publicSiteUrl()).toBe("https://example.test");
  });
});
