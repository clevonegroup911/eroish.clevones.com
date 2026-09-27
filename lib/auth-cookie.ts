export const ADMIN_SESSION_COOKIE = "ejc_admin_session";

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
