import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE, verifyAdminToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) redirect("/admin/login");
  const session = await verifyAdminToken(token);
  if (!session) redirect("/admin/login");
  const user = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/admin/login");
  return user;
}
