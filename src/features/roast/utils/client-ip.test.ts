import { describe, expect, it } from "vitest";
import { hashClientIp, pickClientIp } from "@/features/roast/utils/client-ip";

describe("client-ip", () => {
  it("picks first ip from x-forwarded-for", () => {
    expect(pickClientIp("1.1.1.1, 2.2.2.2", null)).toBe("1.1.1.1");
  });

  it("falls back to remote address", () => {
    expect(pickClientIp(null, "9.9.9.9")).toBe("9.9.9.9");
  });

  it("returns stable hash", () => {
    expect(hashClientIp("1.1.1.1")).toHaveLength(64);
    expect(hashClientIp("1.1.1.1")).toBe(hashClientIp("1.1.1.1"));
  });
});
