import { isAdminPath, isPublicAdminPath } from "@/lib/auth-cookie";
import { safeRelativePath } from "@/lib/safe-relative-path";

export const MAX_ADMIN_NEXT_LENGTH = 512;
export const ADMIN_NEXT_FALLBACK = "/admin";

/**
 * After login, send the user only to a same-origin /admin console path.
 * Non-admin destinations, /admin/login itself, and overlong values fall back
 * to /admin. Query strings on console paths are kept.
 */
export function safeAdminNext(raw: string | null | undefined): string {
  if (!raw || raw.length > MAX_ADMIN_NEXT_LENGTH) return ADMIN_NEXT_FALLBACK;
  const path = safeRelativePath(raw);
  const pathname = path.split("?")[0] ?? path;
  if (!isAdminPath(pathname) || isPublicAdminPath(pathname)) return ADMIN_NEXT_FALLBACK;
  return path;
}

export function adminLoginPath(nextPath: string): string {
  return `/admin/login?next=${encodeURIComponent(safeAdminNext(nextPath))}`;
}

/**
 * Next's rewrite can decode `to` once, so `next=` may arrive as
 * `/admin/login?next=/admin/ledger?x=1&y=2`. Do not parse that with
 * URLSearchParams (it would treat `&y=2` as a sibling). Slice after `next=`.
 * Only decodeURIComponent when the slice is still percent-encoded (`%2F…`);
 * a second decode would turn `tab=a%26b` into `tab=a&b`.
 */
export function reencodeAdminLoginRedirect(to: string): string {
  if (!to.startsWith("/admin/login")) return to;
  const marker = "next=";
  const idx = to.indexOf(marker);
  if (idx === -1) return to;
  const rawNext = to.slice(idx + marker.length);
  const next = rawNext.startsWith("%") ? decodeOnce(rawNext) : rawNext;
  return adminLoginPath(next);
}

function decodeOnce(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
