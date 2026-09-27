import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const ADMIN_SESSION_TTL_SECONDS = Number(process.env.AUTH_SESSION_TTL_SECONDS ?? 28800);

export function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(
  userId: string,
  email: string,
  jti: string = crypto.randomUUID(),
): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_TTL_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function verifyAdminToken(
  token: string,
): Promise<{ userId: string; email: string; jti: string } | null> {
  if (!token || token.length < 16) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.jti !== "string") {
      return null;
    }
    return { userId: payload.sub, email: payload.email, jti: payload.jti };
  } catch {
    return null;
  }
}
