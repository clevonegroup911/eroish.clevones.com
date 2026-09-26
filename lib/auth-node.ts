import { createHmac, timingSafeEqual } from "node:crypto";

export function hashToken(token: string): string {
  const secret = process.env.AUTH_SECRET?.trim() ?? "dev";
  return createHmac("sha256", secret).update(token).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
