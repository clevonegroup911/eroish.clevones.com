/** Canonical public site URL for SEO. Never taken from Host / X-Forwarded-*. */
export function publicSiteUrl(): string {
  const raw = process.env.SITE_URL?.trim() || "https://eroish.clevones.com";
  return new URL(raw).origin;
}
