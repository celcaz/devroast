import { describe, expect, it } from "vitest";
import { validateCodeLimits } from "@/features/roast/utils/code-limits";

describe("validateCodeLimits", () => {
  it("rejects payload bigger than 12KB", () => {
    const code = "a".repeat(12 * 1024 + 1);
    expect(() => validateCodeLimits(code)).toThrow(/12 KB/i);
  });

  it("rejects payload above 300 lines", () => {
    const code = Array.from({ length: 301 }, () => "x").join("\n");
    expect(() => validateCodeLimits(code)).toThrow(/300 lines/i);
  });
});
