const MAX_LINES = 300;
const MAX_BYTES = 12 * 1024;

function validateCodeLimits(code: string): void {
  const bytes = new TextEncoder().encode(code).length;
  const lines = code.length === 0 ? 0 : code.split("\n").length;

  if (bytes > MAX_BYTES) {
    throw new Error("Code exceeds 12 KB limit");
  }

  if (lines > MAX_LINES) {
    throw new Error("Code exceeds 300 lines limit");
  }
}

export { MAX_BYTES, MAX_LINES, validateCodeLimits };
