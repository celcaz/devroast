import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getRoastByIdMock } = vi.hoisted(() => ({
  getRoastByIdMock: vi.fn(),
}));

vi.mock("@/features/roast/queries/get-roast-by-id", () => ({
  getRoastById: getRoastByIdMock,
}));

import RoastDetailsPage from "@/app/roast/[id]/page";

describe("RoastDetailsPage", () => {
  beforeEach(() => {
    getRoastByIdMock.mockReset();
  });

  it.skip("renders roast data from getRoastById", async () => {
    getRoastByIdMock.mockResolvedValue({
      roastId: "abc",
      submissionId: "sub-1",
      score: 4.2,
      verdict: "needs_serious_help",
      roastQuote: "well... this needs work",
      suggestedFix:
        "const total = items.reduce((sum, item) => sum + item.price, 0);",
      modelUsed: "gpt-4.1-mini",
      createdAt: new Date(),
      code: "var total = 0;",
      language: "javascript",
      lineCount: 1,
      issues: [
        {
          id: "issue-1",
          severity: "warning",
          title: "imperative loop",
          description: "prefer reduce",
          order: 0,
        },
      ],
    });

    const page = await RoastDetailsPage({
      params: Promise.resolve({ id: "abc" }),
    });
    render(page);

    expect(await screen.findByText(/verdict:/i)).toBeInTheDocument();
    expect(screen.getByText(/roast id: abc/i)).toBeInTheDocument();
    expect(screen.getByText(/detailed_analysis/i)).toBeInTheDocument();
  });

  it.skip("hides share button in v1", async () => {
    getRoastByIdMock.mockResolvedValue({
      roastId: "abc",
      submissionId: "sub-1",
      score: 4.2,
      verdict: "needs_serious_help",
      roastQuote: "well... this needs work",
      suggestedFix:
        "const total = items.reduce((sum, item) => sum + item.price, 0);",
      modelUsed: "gpt-4.1-mini",
      createdAt: new Date(),
      code: "var total = 0;",
      language: "javascript",
      lineCount: 1,
      issues: [],
    });

    const page = await RoastDetailsPage({
      params: Promise.resolve({ id: "abc" }),
    });
    render(page);

    expect(
      screen.queryByRole("button", { name: /share_roast/i }),
    ).not.toBeInTheDocument();
  });
});
