import { describe, expect, it } from "vitest";

import {
  ADMIN_NEXT_FALLBACK,
  adminLoginPath,
  reencodeAdminLoginRedirect,
  safeAdminNext,
} from "@/lib/admin-login-path";

describe("adminLoginPath", () => {
  it("URL-encodes the next path", () => {
    expect(adminLoginPath("/admin/connect")).toBe("/admin/login?next=%2Fadmin%2Fconnect");
  });

  it("keeps pathname and query string on console paths", () => {
    expect(safeAdminNext("/admin/ledger?x=1&y=2")).toBe("/admin/ledger?x=1&y=2");
    expect(adminLoginPath("/admin/ledger?x=1&y=2")).toBe(
      "/admin/login?next=%2Fadmin%2Fledger%3Fx%3D1%26y%3D2",
    );
  });

  it("rejects next values outside /admin", () => {
    expect(safeAdminNext("/fr")).toBe(ADMIN_NEXT_FALLBACK);
    expect(safeAdminNext("/en/connect")).toBe(ADMIN_NEXT_FALLBACK);
    expect(safeAdminNext("/")).toBe(ADMIN_NEXT_FALLBACK);
  });

  it("re-encodes a rewrite-decoded login URL without dropping query pairs", () => {
    expect(reencodeAdminLoginRedirect("/admin/login?next=/admin/ledger?x=1&y=2")).toBe(
      "/admin/login?next=%2Fadmin%2Fledger%3Fx%3D1%26y%3D2",
    );
    expect(reencodeAdminLoginRedirect("/admin/login?next=%2Fadmin%2Fledger%3Fx%3D1%26y%3D2")).toBe(
      "/admin/login?next=%2Fadmin%2Fledger%3Fx%3D1%26y%3D2",
    );
  });

  it("rejects /admin/login and overlong values", () => {
    expect(safeAdminNext("/admin/login")).toBe(ADMIN_NEXT_FALLBACK);
    expect(safeAdminNext("/admin/login?next=%2Fadmin")).toBe(ADMIN_NEXT_FALLBACK);
    expect(safeAdminNext(`/admin/now?q=${"a".repeat(600)}`)).toBe(ADMIN_NEXT_FALLBACK);
  });
});
