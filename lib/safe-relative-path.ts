const ALLOWED = /^\/(?![\/\\])[^\s\x00-\x1f\x7f\\]*$/;
export const MAX_RELATIVE_PATH_LENGTH = 1024;

/** Round-4 Fedora open-redirect probes. Each must resolve to `/`. */
export const OPEN_REDIRECT_PROBES = [
  "//evil.example",
  "/\\evil.example",
  "https://evil.example",
  "javascript:alert(1)",
  "\t/evil.example",
  " /evil.example",
  "%09/evil.example",
  "%20/evil.example",
  "%0d/evil.example",
  "%0a/evil.example",
  "%00/evil.example",
  "%7f/evil.example",
] as const;

/** Extra encoded-path probes from round 6. */
export const EXTRA_REDIRECT_PROBES = ["/%09/", "/%2F%2F", "/%5C", "/%252F", "%252F"] as const;

function hasUnsafeChars(value: string): boolean {
  return /[\s\x00-\x1f\x7f\\]/.test(value);
}

function fullyDecode(value: string): string | null {
  let current = value;
  for (let i = 0; i < 4; i += 1) {
    if (hasUnsafeChars(current)) return null;
    let next: string;
    try {
      next = decodeURIComponent(current);
    } catch {
      return null;
    }
    if (next === current) return current;
    current = next;
  }
  return hasUnsafeChars(current) ? null : current;
}

function isSafeForm(value: string): boolean {
  if (!ALLOWED.test(value)) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return false;
  if (value.startsWith("//") || value.startsWith("/\\")) return false;
  return true;
}

export function safeRelativePath(raw: string | null | undefined): string {
  const value = raw ?? "";
  if (!value || value.length > MAX_RELATIVE_PATH_LENGTH) return "/";
  if (!isSafeForm(value)) return "/";
  const decoded = fullyDecode(value);
  if (decoded == null || !isSafeForm(decoded)) return "/";
  const withoutHash = value.split("#")[0] ?? value;
  if (!isSafeForm(withoutHash)) return "/";
  return withoutHash;
}
