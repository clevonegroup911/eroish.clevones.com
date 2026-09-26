import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.redirect(new URL("/admin/login", process.env.APP_ORIGIN ?? "http://127.0.0.1:3000"));
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
