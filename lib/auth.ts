import { SignJWT, jwtVerify } from "jose";

export { ADMIN_SESSION_COOKIE, isAdminPath, isPublicAdminPath } from "@/lib/auth-cookie";

const SESSION_TTL_SECONDS = Number(process.env.AUTH_SESSION_TTL_SECONDS ?? 28800);

export function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function verifyAdminToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { userId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export function getTrustedOrigin(fallback: string): string {
  const raw = process.env.APP_ORIGIN?.trim();
  const isProduction = process.env.NODE_ENV === "production";
  if (raw) {
    const parsed = new URL(raw);
    const loopback = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
    if (isProduction && parsed.protocol !== "https:" && !loopback) {
      throw new Error("APP_ORIGIN must use https: in production.");
    }
    return parsed.origin;
  }
  if (isProduction) {
    throw new Error("APP_ORIGIN must be set in production.");
  }
  return fallback;
}
