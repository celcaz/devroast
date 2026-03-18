"use server";

import { db } from "@/db";
import { roastIssues, roasts } from "@/db/schema";
import type { RoastOutput } from "@/features/roast/schemas/roast-output";

type SaveRoastInput = {
  submissionId: string;
  output: RoastOutput;
  modelUsed?: string;
};

async function saveRoast({ submissionId, output, modelUsed }: SaveRoastInput) {
  return db.transaction(async (tx) => {
    const [roast] = await tx
      .insert(roasts)
      .values({
        submissionId,
        score: output.score.toFixed(1),
        verdict: output.verdict,
        roastQuote: output.roastQuote,
        suggestedFix: output.suggestedFix,
        modelUsed,
      })
      .returning({
        id: roasts.id,
        submissionId: roasts.submissionId,
        score: roasts.score,
        verdict: roasts.verdict,
        roastQuote: roasts.roastQuote,
        suggestedFix: roasts.suggestedFix,
        modelUsed: roasts.modelUsed,
        createdAt: roasts.createdAt,
      });

    if (output.issues.length > 0) {
      await tx.insert(roastIssues).values(
        output.issues.map((issue, index) => ({
          roastId: roast.id,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          order: index,
        })),
      );
    }

    return roast;
  });
}

export type { SaveRoastInput };
export { saveRoast };
