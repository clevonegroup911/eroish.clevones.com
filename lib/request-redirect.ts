const LOOPBACK = /^(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/i;

export function buildRedirectLocation(input: {
  pathname: string;
  search?: string;
  host: string | null;
  protocol: string;
  appOrigin?: string;
}): string {
  const search = input.search ?? "";
  const proto = input.protocol.endsWith(":") ? input.protocol : `${input.protocol}:`;
  const host = input.host?.trim() ?? "";
  const appOrigin = input.appOrigin?.trim();
  const origin =
    host && LOOPBACK.test(host)
      ? `${proto}//${host}`
      : appOrigin || (host ? `${proto}//${host}` : `${proto}//127.0.0.1`);
  return new URL(`${input.pathname}${search}`, `${origin.replace(/\/$/, "")}/`).toString();
}
