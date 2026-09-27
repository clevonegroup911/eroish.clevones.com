import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  isAdminPath,
  isMetadataPath,
  isPublicAdminPath,
} from "@/lib/auth-cookie";
import { verifyAdminToken } from "@/lib/auth-verify";
import { buildCsp } from "@/lib/csp";
import { defaultLocale, isLocale, negotiateLocale } from "@/lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;

function localeFromPath(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && isLocale(first)) return first;
  if (isAdminPath(pathname)) return "en";
  return defaultLocale;
}

function applySecurity(request: NextRequest, response: NextResponse, nonce: string, csp: string) {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-nonce", nonce);
  response.headers.set("x-locale", localeFromPath(request.nextUrl.pathname));
  return response;
}

function relativeRedirect(request: NextRequest, location: string, nonce: string, csp: string) {
  const response = new NextResponse(null, {
    status: 307,
    headers: { Location: location },
  });
  return applySecurity(request, response, nonce, csp);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = crypto.randomUUID();
  const isDev = process.env.NODE_ENV !== "production";
  const csp = buildCsp(nonce, isDev);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", localeFromPath(pathname));
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const pass = () =>
    applySecurity(
      request,
      NextResponse.next({ request: { headers: requestHeaders } }),
      nonce,
      csp,
    );

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/health" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/feed.xml" ||
    pathname === "/feed.atom" ||
    pathname === "/favicon.ico" ||
    isMetadataPath(pathname) ||
    PUBLIC_FILE.test(pathname)
  ) {
    return pass();
  }

  if (isAdminPath(pathname)) {
    if (isPublicAdminPath(pathname)) {
      return pass();
    }
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = token ? await verifyAdminToken(token) : null;
    if (!session) {
      const next = encodeURIComponent(pathname);
      return relativeRedirect(request, `/admin/login?next=${next}`, nonce, csp);
    }
    return pass();
  }

  const first = pathname.split("/").filter(Boolean)[0];
  if (first && isLocale(first)) {
    return pass();
  }

  const locale = negotiateLocale(request.headers.get("accept-language")) || defaultLocale;
  const suffix = pathname === "/" ? "" : pathname;
  return relativeRedirect(request, `/${locale}${suffix}`, nonce, csp);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
