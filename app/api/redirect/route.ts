import { NextResponse } from "next/server";

import { safeRelativePath } from "@/lib/safe-relative-path";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const to = safeRelativePath(new URL(request.url).searchParams.get("to"));
  return new NextResponse(null, {
    status: 307,
    headers: { Location: to },
  });
}
