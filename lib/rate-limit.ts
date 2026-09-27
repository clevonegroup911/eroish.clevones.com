export type RateLimitStore = {
  get(key: string): Promise<{ count: number; windowStart: number } | null>;
  set(key: string, value: { count: number; windowStart: number }): Promise<void>;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
};

const memory = new Map<string, { count: number; windowStart: number }>();

export const memoryRateLimitStore: RateLimitStore = {
  async get(key) {
    return memory.get(key) ?? null;
  },
  async set(key, value) {
    memory.set(key, value);
  },
};

export async function consumeRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
  store?: RateLimitStore;
}): Promise<RateLimitResult> {
  const now = input.now ?? Date.now();
  const store = input.store ?? memoryRateLimitStore;
  const current = await store.get(input.key);

  if (!current || now - current.windowStart >= input.windowMs) {
    await store.set(input.key, { count: 1, windowStart: now });
    return { ok: true, remaining: input.limit - 1, retryAfterMs: input.windowMs };
  }

  if (current.count >= input.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterMs: input.windowMs - (now - current.windowStart),
    };
  }

  await store.set(input.key, { count: current.count + 1, windowStart: current.windowStart });
  return {
    ok: true,
    remaining: input.limit - current.count - 1,
    retryAfterMs: input.windowMs - (now - current.windowStart),
  };
}
