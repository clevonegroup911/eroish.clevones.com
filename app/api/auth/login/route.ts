import argon2 from "argon2";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ADMIN_SESSION_COOKIE, hashToken, signAdminToken } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email.trim().toLowerCase() },
  });
  if (!user || !(await argon2.verify(user.passwordHash, parsed.data.password))) {
    return NextResponse.json({ error: "failed" }, { status: 401 });
  }

  const token = await signAdminToken(user.id, user.email);
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
  });
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await writeAudit({
    actorId: user.id,
    action: "LOGIN",
    entity: "AdminUser",
    entityId: user.id,
    summary: "Admin signed in",
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return response;
}
