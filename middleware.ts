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
import { adminLoginPath } from "@/lib/admin-login-path";
import { defaultLocale, isLocale, negotiateLocale } from "@/lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;

function localeFromPath(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && isLocale(first)) return first;
  if (isAdminPath(pathname)) return "en";
  return defaultLocale;
}

function applySecurity(request: NextRequest, response: NextResponse, csp: string) {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("x-locale", localeFromPath(request.nextUrl.pathname));
  // Next copies request x-nonce onto the response; never set that header.
  response.headers.delete("x-nonce");
  response.headers.delete("x-request-path");
  return response;
}

function pathAndSearch(url: URL): string {
  const query = url.searchParams.toString();
  return query ? `${url.pathname}?${query}` : url.pathname;
}

function rewriteToRelativeRedirect(request: NextRequest, to: string, csp: string) {
  const url = new URL("/api/redirect", request.nextUrl.origin);
  url.searchParams.set("to", to);
  const response = NextResponse.rewrite(url);
  return applySecurity(request, response, csp);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = crypto.randomUUID();
  const isDev = process.env.NODE_ENV !== "production";
  const csp = buildCsp(nonce, isDev);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", localeFromPath(pathname));
  requestHeaders.set("x-request-path", pathAndSearch(request.nextUrl));
  // Next 15 reads the script nonce from this request CSP, not from x-nonce.
  requestHeaders.set("Content-Security-Policy", csp);
  requestHeaders.delete("x-nonce");

  const pass = () => {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    return applySecurity(request, response, csp);
  };

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
      return rewriteToRelativeRedirect(
        request,
        adminLoginPath(pathAndSearch(request.nextUrl)),
        csp,
      );
    }
    return pass();
  }

  const first = pathname.split("/").filter(Boolean)[0];
  if (first && isLocale(first)) {
    return pass();
  }

  const locale = negotiateLocale(request.headers.get("accept-language")) || defaultLocale;
  const suffix = pathname === "/" ? "" : pathname;
  return rewriteToRelativeRedirect(request, `/${locale}${suffix}`, csp);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
