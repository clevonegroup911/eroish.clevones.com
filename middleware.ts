import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  isAdminPath,
  isMetadataPath,
  isPublicAdminPath,
} from "@/lib/auth-cookie";
import { defaultLocale, isLocale, negotiateLocale } from "@/lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;

function localeFromPath(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && isLocale(first)) return first;
  if (isAdminPath(pathname)) return "en";
  return defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", localeFromPath(pathname));

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/health" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/feed.xml" ||
    pathname === "/feed.atom" ||
    isMetadataPath(pathname) ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isAdminPath(pathname)) {
    if (isPublicAdminPath(pathname)) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) {
      const login = request.nextUrl.clone();
      login.pathname = "/admin/login";
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const first = pathname.split("/").filter(Boolean)[0];
  if (first && isLocale(first)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const locale = negotiateLocale(request.headers.get("accept-language")) || defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
