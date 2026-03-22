import { asc, count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { roasts, submissions } from "@/db/schema";

type HomeLeaderboardEntry = {
  roastId: string;
  rank: number;
  score: number;
  language: string;
  code: string;
};

type HomeLeaderboardData = {
  entries: HomeLeaderboardEntry[];
  totalRoasts: number;
  averageScore: number;
};

async function getHomeLeaderboard(limit = 3): Promise<HomeLeaderboardData> {
  const [rows, statsResult] = await Promise.all([
    db
      .select({
        roastId: roasts.id,
        score: roasts.score,
        language: submissions.language,
        code: submissions.code,
      })
      .from(roasts)
      .innerJoin(submissions, eq(submissions.id, roasts.submissionId))
      .orderBy(asc(roasts.score), asc(roasts.createdAt))
      .limit(limit),
    db
      .select({
        totalRoasts: count(roasts.id),
        averageScore: sql<number>`coalesce(avg(${roasts.score}), 0)::float`,
      })
      .from(roasts),
  ]);

  const [stats] = statsResult;

  const entries = rows.map((row, index) => ({
    roastId: row.roastId,
    rank: index + 1,
    score: Number(row.score),
    language: row.language,
    code: row.code,
  }));

  return {
    entries,
    totalRoasts: Number(stats.totalRoasts),
    averageScore: Number(stats.averageScore),
  };
}

export type { HomeLeaderboardData, HomeLeaderboardEntry };
export { getHomeLeaderboard };
