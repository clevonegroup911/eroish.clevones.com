import { NextResponse } from "next/server";

import { safeRelativePath } from "@/lib/safe-relative-path";

export const dynamic = "force-dynamic";

function encodeLoginNext(to: string): string {
  if (!to.startsWith("/admin/login")) return to;
  const parsed = new URL(to, "http://ejc.invalid");
  const next = parsed.searchParams.get("next");
  if (!next) return to;
  return `/admin/login?next=${encodeURIComponent(next)}`;
}

function redirectTo(request: Request) {
  const to = encodeLoginNext(safeRelativePath(new URL(request.url).searchParams.get("to")));
  return new NextResponse(null, {
    status: 307,
    headers: { Location: to },
  });
}

export function GET(request: Request) {
  return redirectTo(request);
}

export function POST(request: Request) {
  return redirectTo(request);
}

export function PUT(request: Request) {
  return redirectTo(request);
}

export function PATCH(request: Request) {
  return redirectTo(request);
}

export function DELETE(request: Request) {
  return redirectTo(request);
}
