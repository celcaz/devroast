import { describe, expect, it, vi } from "vitest";
import {
  analyzeCode,
  DEFAULT_MODEL,
} from "@/features/roast/services/analyze-code";

function createValidOutputText() {
  return JSON.stringify({
    score: 6.2,
    verdict: "getting_there",
    roastQuote: "not bad, but still rough around the edges",
    issues: [
      {
        severity: "warning",
        title: "imperative style",
        description: "can be more declarative",
      },
    ],
    suggestedFix: "Prefer map/reduce where appropriate.",
  });
}

function okOpenAiResponse() {
  return new Response(
    JSON.stringify({
      model: "gpt-4.1-mini",
      output: [
        {
          content: [
            {
              type: "output_text",
              text: createValidOutputText(),
            },
          ],
        },
      ],
    }),
    { status: 200 },
  );
}

describe("analyzeCode", () => {
  it("uses sarcastic prompt when roastMode=true", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue(okOpenAiResponse());

    await analyzeCode({
      code: "const x = 1;",
      language: "javascript",
      roastMode: true,
      fetchImpl: fetchMock,
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.input[0].content).toMatch(/sarcastic/i);
  });

  it("uses OPENAI_MODEL when provided", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-4.1-mini";
    const fetchMock = vi.fn().mockResolvedValue(okOpenAiResponse());

    await analyzeCode({
      code: "const x = 1;",
      language: "javascript",
      roastMode: false,
      fetchImpl: fetchMock,
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.model).toBe("gpt-4.1-mini");
  });

  it("defaults to gpt-4.1-mini when OPENAI_MODEL is unset", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    delete process.env.OPENAI_MODEL;
    const fetchMock = vi.fn().mockResolvedValue(okOpenAiResponse());

    await analyzeCode({
      code: "def f():\n  return 1",
      language: "python",
      roastMode: false,
      fetchImpl: fetchMock,
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.model).toBe(DEFAULT_MODEL);
  });

  it("throws on non-2xx provider response without fallback", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("boom", { status: 500 }));

    await expect(
      analyzeCode({
        code: "const x = 1;",
        language: "typescript",
        roastMode: false,
        fetchImpl: fetchMock,
      }),
    ).rejects.toThrow(/openai request failed/i);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
