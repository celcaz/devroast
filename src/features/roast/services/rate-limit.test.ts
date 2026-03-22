import { describe, expect, it } from "vitest";
import {
  createInMemoryRateLimitRepo,
  evaluateRateLimitWindow,
  hashRateLimitKey,
  MAX_REQUESTS,
} from "@/features/roast/services/rate-limit";

describe("evaluateRateLimitWindow", () => {
  it("allows first request within window", async () => {
    const now = new Date("2026-03-22T10:00:00.000Z");
    const repo = createInMemoryRateLimitRepo();

    const result = await evaluateRateLimitWindow({ key: "k", now, repo });

    expect(result.allowed).toBe(true);
  });

  it("blocks request after limit and returns retryAfterSeconds", async () => {
    const now = new Date("2026-03-22T10:00:00.000Z");
    const repo = createInMemoryRateLimitRepo({
      keyHash: hashRateLimitKey("k"),
      windowStartedAt: now,
      count: MAX_REQUESTS,
    });

    const result = await evaluateRateLimitWindow({ key: "k", now, repo });

    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets counter after 1h window expiry", async () => {
    const started = new Date("2026-03-22T10:00:00.000Z");
    const now = new Date("2026-03-22T11:00:01.000Z");
    const keyHash = hashRateLimitKey("k");
    const repo = createInMemoryRateLimitRepo({
      keyHash,
      windowStartedAt: started,
      count: MAX_REQUESTS,
    });

    const result = await evaluateRateLimitWindow({ key: "k", now, repo });

    expect(result.allowed).toBe(true);
    expect(repo.get(keyHash)?.count).toBe(1);
  });
});
