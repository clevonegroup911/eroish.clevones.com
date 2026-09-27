import argon2 from "argon2";
import { NextResponse } from "next/server";

import { writeAudit } from "@/lib/audit";
import { hashToken } from "@/lib/auth-node";
import { ADMIN_SESSION_COOKIE, signAdminToken } from "@/lib/auth";
import { adminSessionCookieOptions } from "@/lib/auth-cookie";
import { prisma } from "@/lib/db";
import { z } from "@/lib/zod";

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(5)
    .refine((value) => value.includes("@")),
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

  const sessionId = crypto.randomUUID();
  const token = await signAdminToken(user.id, user.email, sessionId);
  await prisma.session.create({
    data: {
      id: sessionId,
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
  response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions(request));
  return response;
}
