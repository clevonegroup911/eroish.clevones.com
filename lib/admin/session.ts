import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth-cookie";
import { verifyAdminToken } from "@/lib/auth-verify";
import { prisma } from "@/lib/db";

export async function readAdminSession(token: string | undefined) {
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function findActiveSession(token: string | undefined) {
  const claims = await readAdminSession(token);
  if (!claims?.jti) return null;
  const row = await prisma.session.findFirst({
    where: {
      id: claims.jti,
      userId: claims.userId,
      expiresAt: { gt: new Date() },
    },
  });
  if (!row) return null;
  return { claims, row };
}

export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const active = await findActiveSession(token);
  if (!active) redirect("/admin/login");
  const user = await prisma.adminUser.findUnique({ where: { id: active.claims.userId } });
  if (!user) redirect("/admin/login");
  return user;
}
