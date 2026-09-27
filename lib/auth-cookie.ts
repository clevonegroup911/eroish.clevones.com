export const ADMIN_SESSION_COOKIE = "ejc_admin_session";
export const ADMIN_SESSION_MAX_AGE = 8 * 60 * 60;

export type CookieSecureInput = {
  nodeEnv?: string;
  forwardedProto?: string | null;
  cookieSecure?: string;
  publicOrigin?: string;
};

/**
 * Secure cookies only when the deployment is production HTTPS.
 *
 * Secure when NODE_ENV=production AND at least one of:
 * - X-Forwarded-Proto (first hop) is https (Nginx on the VM sets this)
 * - COOKIE_SECURE is an explicit truthy override (1/true/yes)
 * - APP_ORIGIN is https
 *
 * COOKIE_SECURE=0/false/no forces the flag off (local http next start).
 * Development is never Secure, so plain http localhost login keeps working.
 */
export function shouldSetSecureCookie(input: CookieSecureInput = {}): boolean {
  const nodeEnv = input.nodeEnv ?? process.env.NODE_ENV;
  const cookieSecure = input.cookieSecure ?? process.env.COOKIE_SECURE;
  const publicOrigin = input.publicOrigin ?? process.env.APP_ORIGIN;
  const override = cookieSecure?.trim().toLowerCase();
  if (override === "0" || override === "false" || override === "no") return false;
  if (nodeEnv !== "production") return false;
  if (override === "1" || override === "true" || override === "yes") return true;
  const proto = input.forwardedProto?.split(",")[0]?.trim().toLowerCase();
  if (proto === "https") return true;
  return (publicOrigin ?? "").trim().toLowerCase().startsWith("https:");
}

export function adminSessionCookieOptions(request?: Request, maxAge: number = ADMIN_SESSION_MAX_AGE) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: shouldSetSecureCookie({
      forwardedProto: request?.headers.get("x-forwarded-proto"),
    }),
    path: "/" as const,
    maxAge,
  };
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isPublicAdminPath(pathname: string): boolean {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

export function isMetadataPath(pathname: string): boolean {
  const clean = pathname.split("?")[0] ?? pathname;
  const stripped = clean.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";
  return (
    stripped === "/favicon.ico" ||
    stripped === "/icon" ||
    stripped === "/apple-icon" ||
    stripped === "/apple-icon.png" ||
    stripped === "/opengraph-image" ||
    stripped === "/twitter-image" ||
    stripped === "/manifest" ||
    stripped === "/manifest.webmanifest" ||
    stripped.startsWith("/icon/") ||
    /^\/icon-/.test(stripped)
  );
}
