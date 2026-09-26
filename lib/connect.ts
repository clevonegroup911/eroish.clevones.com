import { z } from "zod";

export const CONNECT_INTENTS = [
  "BUSINESS",
  "INTRODUCTION",
  "INVITATION",
  "MEDIA",
  "IDEA",
  "OPPORTUNITY",
  "MEETING",
  "OTHER",
] as const;

export const connectSchema = z.object({
  intent: z.enum(CONNECT_INTENTS),
  name: z.string().trim().min(2).max(120),
  organization: z.string().trim().min(1).max(160),
  email: z
    .string()
    .trim()
    .max(200)
    .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^[^\s@]+@localhost$/.test(value), {
      message: "Invalid email",
    }),
  reason: z.string().trim().min(8).max(2000),
  context: z.string().trim().min(8).max(4000),
  whyEjc: z.string().trim().min(8).max(2000),
  requestedAction: z.string().trim().min(4).max(500),
  supporting: z.string().trim().max(4000).optional().default(""),
  website: z.string().max(0).optional().default(""),
});

export type ConnectInput = z.infer<typeof connectSchema>;

export function isHoneypotTriggered(website: string | undefined): boolean {
  return Boolean(website && website.length > 0);
}

export function hashIp(ip: string, secret: string): string {
  let hash = 0;
  const material = `${secret}:${ip}`;
  for (let i = 0; i < material.length; i += 1) {
    hash = (hash * 31 + material.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
