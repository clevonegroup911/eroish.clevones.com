import "@/lib/load-env";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.DATABASE_URL?.startsWith("file:")) {
  void prisma.$executeRawUnsafe("PRAGMA busy_timeout = 15000");
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
