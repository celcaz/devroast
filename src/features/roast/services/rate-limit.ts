import { createHash } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { rateLimitWindows } from "@/db/schema";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;

type EvaluateRateLimitWindowInput = {
  key: string;
  now: Date;
  repo?: RateLimitRepository;
};

type EvaluateRateLimitWindowResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

type RateLimitWindowRecord = {
  keyHash: string;
  windowStartedAt: Date;
  count: number;
};

type RateLimitRepository = {
  getForUpdate: (keyHash: string) => Promise<RateLimitWindowRecord | null>;
  insert: (input: { keyHash: string; now: Date }) => Promise<void>;
  resetWindow: (input: { keyHash: string; now: Date }) => Promise<void>;
  increment: (input: { keyHash: string; now: Date }) => Promise<void>;
};

function hashRateLimitKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

async function evaluateRateLimitWindow({
  key,
  now,
  repo,
}: EvaluateRateLimitWindowInput): Promise<EvaluateRateLimitWindowResult> {
  const keyHash = hashRateLimitKey(key);

  if (repo) {
    const existing = await repo.getForUpdate(keyHash);

    if (!existing) {
      await repo.insert({ keyHash, now });
      return { allowed: true };
    }

    const isExpired =
      now.getTime() - existing.windowStartedAt.getTime() >= WINDOW_MS;

    if (isExpired) {
      await repo.resetWindow({ keyHash, now });
      return { allowed: true };
    }

    if (existing.count >= MAX_REQUESTS) {
      const retryAfterMs =
        existing.windowStartedAt.getTime() + WINDOW_MS - now.getTime();
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
      };
    }

    await repo.increment({ keyHash, now });
    return { allowed: true };
  }

  const { db } = await import("@/db");

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({
        keyHash: rateLimitWindows.keyHash,
        count: rateLimitWindows.count,
        windowStartedAt: rateLimitWindows.windowStartedAt,
      })
      .from(rateLimitWindows)
      .where(eq(rateLimitWindows.keyHash, keyHash))
      .for("update")
      .limit(1);

    if (!existing) {
      await tx.insert(rateLimitWindows).values({
        keyHash,
        count: 1,
        windowStartedAt: now,
        updatedAt: now,
      });
      return { allowed: true };
    }

    const isExpired =
      now.getTime() - existing.windowStartedAt.getTime() >= WINDOW_MS;

    if (isExpired) {
      await tx
        .update(rateLimitWindows)
        .set({
          count: 1,
          windowStartedAt: now,
          updatedAt: now,
        })
        .where(eq(rateLimitWindows.keyHash, keyHash));

      return { allowed: true };
    }

    if (existing.count >= MAX_REQUESTS) {
      const retryAfterMs =
        existing.windowStartedAt.getTime() + WINDOW_MS - now.getTime();
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
      };
    }

    await tx
      .update(rateLimitWindows)
      .set({
        count: sql`${rateLimitWindows.count} + 1`,
        updatedAt: now,
      })
      .where(eq(rateLimitWindows.keyHash, keyHash));

    return { allowed: true };
  });
}

function createInMemoryRateLimitRepo(
  seed?: RateLimitWindowRecord,
): RateLimitRepository & {
  get: (keyHash: string) => RateLimitWindowRecord | undefined;
} {
  const store = new Map<string, RateLimitWindowRecord>();

  if (seed) {
    store.set(seed.keyHash, seed);
  }

  return {
    async getForUpdate(keyHash) {
      return store.get(keyHash) ?? null;
    },
    async insert({ keyHash, now }) {
      store.set(keyHash, {
        keyHash,
        windowStartedAt: now,
        count: 1,
      });
    },
    async resetWindow({ keyHash, now }) {
      store.set(keyHash, {
        keyHash,
        windowStartedAt: now,
        count: 1,
      });
    },
    async increment({ keyHash }) {
      const existing = store.get(keyHash);
      if (!existing) return;

      store.set(keyHash, {
        ...existing,
        count: existing.count + 1,
      });
    },
    get(keyHash) {
      return store.get(keyHash);
    },
  };
}

export type {
  EvaluateRateLimitWindowInput,
  EvaluateRateLimitWindowResult,
  RateLimitRepository,
  RateLimitWindowRecord,
};
export {
  createInMemoryRateLimitRepo,
  evaluateRateLimitWindow,
  hashRateLimitKey,
  MAX_REQUESTS,
  WINDOW_MS,
};
