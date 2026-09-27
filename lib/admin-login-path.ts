export function adminLoginPath(nextPath: string): string {
  const next = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/admin";
  return `/admin/login?next=${encodeURIComponent(next)}`;
}
