const ALLOWED = /^\/(?![\/\\])[^\s\x00-\x1f\x7f\\]*$/;

export function safeRelativePath(raw: string | null | undefined): string {
  const value = raw ?? "";
  if (!ALLOWED.test(value)) return "/";
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return "/";
  return value;
}
