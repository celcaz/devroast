import { asc, count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { roasts, submissions } from "@/db/schema";

type LeaderboardEntry = {
  roastId: string;
  submissionId: string;
  score: number;
  language: string;
  lineCount: number;
  code: string;
  createdAt: Date;
};

type LeaderboardData = {
  entries: LeaderboardEntry[];
  totalSubmissions: number;
  averageScore: number;
};

async function getLeaderboard(limit = 20): Promise<LeaderboardData> {
  const [rows, statsResult] = await Promise.all([
    db
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
      .limit(limit),
    db
      .select({
        totalSubmissions: count(submissions.id),
        averageScore: sql<number>`coalesce(avg(${roasts.score}), 0)::float`,
      })
      .from(roasts)
      .innerJoin(submissions, eq(submissions.id, roasts.submissionId)),
  ]);

  const [stats] = statsResult;

  const entries = rows.map((row) => ({
    roastId: row.roastId,
    submissionId: row.submissionId,
    score: Number(row.score),
    language: row.language,
    lineCount: row.lineCount,
    code: row.code,
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
