import { asc, count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { roasts, submissions } from "@/db/schema";

type LeaderboardEntry = {
  roastId: string;
  submissionId: string;
  score: number;
  language: string;
  lineCount: number;
  codePreview: string;
  createdAt: Date;
};

type LeaderboardData = {
  entries: LeaderboardEntry[];
  totalSubmissions: number;
  averageScore: number;
};

function toCodePreview(code: string, maxLength = 120): string {
  const normalized = code.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

async function getLeaderboard(limit = 50): Promise<LeaderboardData> {
  const rows = await db
    .select({
      roastId: roasts.id,
      submissionId: submissions.id,
      score: roasts.score,
      language: submissions.language,
      lineCount: submissions.lineCount,
      code: submissions.code,
      createdAt: roasts.createdAt,
    })
    .from(roasts)
    .innerJoin(submissions, eq(submissions.id, roasts.submissionId))
    .orderBy(asc(roasts.score), asc(roasts.createdAt))
    .limit(limit);

  const [stats] = await db
    .select({
      totalSubmissions: count(submissions.id),
      averageScore: sql<number>`coalesce(avg(${roasts.score}), 0)::float`,
    })
    .from(roasts)
    .innerJoin(submissions, eq(submissions.id, roasts.submissionId));

  const entries = rows.map((row) => ({
    roastId: row.roastId,
    submissionId: row.submissionId,
    score: Number(row.score),
    language: row.language,
    lineCount: row.lineCount,
    codePreview: toCodePreview(row.code),
    createdAt: row.createdAt,
  }));

  return {
    entries,
    totalSubmissions: Number(stats.totalSubmissions),
    averageScore: Number(stats.averageScore),
  };
}

export type { LeaderboardData, LeaderboardEntry };
export { getLeaderboard };
