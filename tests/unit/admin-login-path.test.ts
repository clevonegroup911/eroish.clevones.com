import { describe, expect, it } from "vitest";

import { adminLoginPath } from "@/lib/admin-login-path";

describe("adminLoginPath", () => {
  it("URL-encodes the next path", () => {
    expect(adminLoginPath("/admin/connect")).toBe("/admin/login?next=%2Fadmin%2Fconnect");
  });
});
