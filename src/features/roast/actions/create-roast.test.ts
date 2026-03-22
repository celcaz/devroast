import { describe, expect, it, vi } from "vitest";
import { createRoastAction } from "@/features/roast/actions/create-roast";

function createHeaders(forwardedFor = "1.1.1.1") {
  return new Headers({
    "x-forwarded-for": forwardedFor,
  });
}

describe("createRoastAction", () => {
  it("returns RATE_LIMIT error when quota exceeded", async () => {
    const result = await createRoastAction(
      {
        code: "const x = 1;",
        language: "javascript",
        roastMode: true,
      },
      {
        headersImpl: async () => createHeaders(),
        evaluateRateLimitWindowImpl: async () => ({
          allowed: false,
          retryAfterSeconds: 1200,
        }),
      },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("RATE_LIMIT");
      expect(result.error.retryAfterSeconds).toBe(1200);
    }
  });

  it("redirects on success", async () => {
    const redirectImpl = vi.fn((path: string) => {
      throw Object.assign(new Error("NEXT_REDIRECT"), {
        digest: `NEXT_REDIRECT;${path}`,
      });
    });

    await expect(
      createRoastAction(
        {
          code: "const x = 1;",
          language: "javascript",
          roastMode: true,
        },
        {
          headersImpl: async () => createHeaders(),
          evaluateRateLimitWindowImpl: async () => ({ allowed: true }),
          analyzeCodeImpl: async () => ({
            score: 7,
            verdict: "getting_there",
            roastQuote: "close enough",
            issues: [],
            suggestedFix: "none",
            modelUsed: "gpt-4.1-mini",
          }),
          submitCodeImpl: async () => ({
            id: "sub_1",
            language: "javascript",
            lineCount: 1,
            createdAt: new Date(),
          }),
          saveRoastImpl: async () => ({
            id: "roast_1",
            submissionId: "sub_1",
            score: "7.0",
            verdict: "getting_there",
            roastQuote: "close enough",
            suggestedFix: "none",
            modelUsed: "gpt-4.1-mini",
            createdAt: new Date(),
          }),
          redirectImpl,
        },
      ),
    ).rejects.toMatchObject({
      digest: expect.stringMatching(/NEXT_REDIRECT;\/roast\/roast_1/),
    });
  });

  it("returns AI_ERROR when provider fails and logs safe context", async () => {
    const logError = vi.fn();

    const result = await createRoastAction(
      {
        code: "const x = 1;",
        language: "javascript",
        roastMode: false,
      },
      {
        headersImpl: async () => createHeaders(),
        evaluateRateLimitWindowImpl: async () => ({ allowed: true }),
        analyzeCodeImpl: async () => {
          throw new Error("provider down");
        },
        logError,
      },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("AI_ERROR");
    }

    expect(logError).toHaveBeenCalledWith(
      "roast_create_failed",
      expect.objectContaining({
        code: "AI_ERROR",
        language: "javascript",
        roastMode: false,
      }),
    );
  });
});
