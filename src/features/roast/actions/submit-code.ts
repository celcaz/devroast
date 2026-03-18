"use server";

import { db } from "@/db";
import { submissions } from "@/db/schema";

type SubmitCodeInput = {
  code: string;
  language: typeof submissions.$inferInsert.language;
};

async function submitCode({ code, language }: SubmitCodeInput) {
  const normalizedCode = code.trimEnd();
  const lineCount = normalizedCode ? normalizedCode.split("\n").length : 1;

  const [submission] = await db
    .insert(submissions)
    .values({
      code: normalizedCode,
      language,
      lineCount,
    })
    .returning({
      id: submissions.id,
      language: submissions.language,
      lineCount: submissions.lineCount,
      createdAt: submissions.createdAt,
    });

  return submission;
}

export type { SubmitCodeInput };
export { submitCode };
