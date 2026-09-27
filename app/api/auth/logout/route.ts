import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: "/admin/login" },
  });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
