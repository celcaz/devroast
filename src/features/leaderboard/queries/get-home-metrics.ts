import { avg, count } from "drizzle-orm";
import { db } from "@/db";
import { roasts } from "@/db/schema";

type HomeMetrics = {
  totalRoastedCodes: number;
  averageScore: number;
};

async function getHomeMetrics(): Promise<HomeMetrics> {
  const [stats] = await db
    .select({
      totalRoastedCodes: count(roasts.id),
      averageScore: avg(roasts.score),
    })
    .from(roasts);

  return {
    totalRoastedCodes: Number(stats.totalRoastedCodes),
    averageScore: Number(stats.averageScore),
  };
}

export type { HomeMetrics };
export { getHomeMetrics };
