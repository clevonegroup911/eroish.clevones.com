import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { findActiveSession } from "@/lib/admin/session";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { hashToken } from "@/lib/auth-node";
import { prisma } from "@/lib/db";

export async function POST() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const active = await findActiveSession(token);
  if (active) {
    await prisma.session.deleteMany({ where: { id: active.row.id } });
  } else if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: "/admin/login" },
  });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
