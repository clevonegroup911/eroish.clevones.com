import { SignJWT } from "jose";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getAuthSecret, signAdminToken, verifyAdminToken } from "@/lib/auth-verify";

const SECRET = "dev-only-auth-secret-change-before-production-use-32b";

describe("verifyAdminToken", () => {
  const original = process.env.AUTH_SECRET;

  beforeEach(() => {
    process.env.AUTH_SECRET = SECRET;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = original;
  });

  it("accepts a freshly signed token", async () => {
    const token = await signAdminToken("user-1", "admin@localhost");
    await expect(verifyAdminToken(token)).resolves.toEqual({
      userId: "user-1",
      email: "admin@localhost",
    });
  });

  it("rejects a forged cookie value", async () => {
    await expect(verifyAdminToken("x")).resolves.toBeNull();
    await expect(verifyAdminToken("not-a-jwt")).resolves.toBeNull();
    await expect(verifyAdminToken("")).resolves.toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await new SignJWT({ email: "admin@localhost" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("user-1")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(getAuthSecret());
    await expect(verifyAdminToken(token)).resolves.toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await signAdminToken("user-1", "admin@localhost");
    const tampered = `${token.slice(0, -6)}aaaaaa`;
    await expect(verifyAdminToken(tampered)).resolves.toBeNull();
  });
});
