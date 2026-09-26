import { describe, expect, it } from "vitest";

import { connectSchema, isHoneypotTriggered } from "@/lib/connect";
import { consumeRateLimit, type RateLimitStore } from "@/lib/rate-limit";

describe("connect validation", () => {
  it("accepts a complete intent payload", () => {
    const parsed = connectSchema.safeParse({
      intent: "MEDIA",
      name: "Ada Journalist",
      organization: "Independent",
      email: "ada@example.com",
      reason: "Interview request about the public record",
      context: "Writing a profile using only confirmed facts",
      whyEjc: "The identity platform is the canonical source",
      requestedAction: "Schedule a recorded interview",
      supporting: "",
      website: "",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a generic empty form", () => {
    expect(connectSchema.safeParse({}).success).toBe(false);
  });

  it("treats a filled honeypot as spam", () => {
    expect(isHoneypotTriggered("http://spam.test")).toBe(true);
    expect(isHoneypotTriggered("")).toBe(false);
  });
});

describe("rate limit", () => {
  it("blocks after the window limit", async () => {
    const memory = new Map<string, { count: number; windowStart: number }>();
    const store: RateLimitStore = {
      async get(key) {
        return memory.get(key) ?? null;
      },
      async set(key, value) {
        memory.set(key, value);
      },
    };

    const first = await consumeRateLimit({ key: "t", limit: 2, windowMs: 1000, now: 0, store });
    const second = await consumeRateLimit({ key: "t", limit: 2, windowMs: 1000, now: 10, store });
    const third = await consumeRateLimit({ key: "t", limit: 2, windowMs: 1000, now: 20, store });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(third.ok).toBe(false);
  });
});
