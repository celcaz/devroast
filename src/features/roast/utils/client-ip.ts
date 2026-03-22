import { createHash } from "node:crypto";

function pickClientIp(
  xForwardedFor: string | null | undefined,
  remoteAddress: string | null | undefined,
): string {
  const firstForwarded = xForwardedFor
    ?.split(",")
    .map((value) => value.trim())
    .find(Boolean);

  return firstForwarded ?? remoteAddress ?? "0.0.0.0";
}

function hashClientIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export { hashClientIp, pickClientIp };
