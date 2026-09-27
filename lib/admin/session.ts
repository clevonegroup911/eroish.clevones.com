import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth-cookie";
import { verifyAdminToken } from "@/lib/auth-verify";
import { prisma } from "@/lib/db";

export async function readAdminSession(token: string | undefined) {
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const session = await readAdminSession(token);
  if (!session) redirect("/admin/login");
  const user = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/admin/login");
  return user;
}
