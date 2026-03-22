import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { roastIssues, roasts, submissions } from "@/db/schema";

type RoastIssue = {
  id: string;
  severity: "critical" | "warning" | "good";
  title: string;
  description: string;
  order: number;
};

type RoastDetails = {
  roastId: string;
  submissionId: string;
  score: number;
  verdict:
    | "legendary_disaster"
    | "needs_serious_help"
    | "mediocre_at_best"
    | "getting_there"
    | "actually_decent";
  roastQuote: string;
  suggestedFix: string;
  modelUsed: string | null;
  createdAt: Date;
  code: string;
  language: string;
  lineCount: number;
  issues: RoastIssue[];
};

async function getRoastById(id: string): Promise<RoastDetails | null> {
  const [base] = await db
    .select({
      roastId: roasts.id,
      submissionId: submissions.id,
      score: roasts.score,
      verdict: roasts.verdict,
      roastQuote: roasts.roastQuote,
      suggestedFix: roasts.suggestedFix,
      modelUsed: roasts.modelUsed,
      createdAt: roasts.createdAt,
      code: submissions.code,
      language: submissions.language,
      lineCount: submissions.lineCount,
    })
    .from(roasts)
    .innerJoin(submissions, eq(submissions.id, roasts.submissionId))
    .where(eq(roasts.id, id))
    .limit(1);

  if (!base) {
    return null;
  }

  const issuesRows = await db
    .select({
      id: roastIssues.id,
      severity: roastIssues.severity,
      title: roastIssues.title,
      description: roastIssues.description,
      order: roastIssues.order,
    })
    .from(roastIssues)
    .where(eq(roastIssues.roastId, id))
    .orderBy(asc(roastIssues.order), asc(roastIssues.id));

  return {
    roastId: base.roastId,
    submissionId: base.submissionId,
    score: Number(base.score),
    verdict: base.verdict,
    roastQuote: base.roastQuote,
    suggestedFix: base.suggestedFix ?? "",
    modelUsed: base.modelUsed,
    createdAt: base.createdAt,
    code: base.code,
    language: base.language,
    lineCount: base.lineCount,
    issues: issuesRows,
  };
}

export type { RoastDetails, RoastIssue };
export { getRoastById };
