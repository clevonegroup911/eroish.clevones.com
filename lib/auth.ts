export { ADMIN_SESSION_COOKIE, isAdminPath, isPublicAdminPath } from "@/lib/auth-cookie";
export { getAuthSecret, signAdminToken, verifyAdminToken } from "@/lib/auth-verify";

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
