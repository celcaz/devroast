import { getHomeMetrics } from "@/features/leaderboard/queries/get-home-metrics";
import { publicProcedure, router } from "@/trpc/init";

const metricsRouter = router({
  homepage: publicProcedure.query(async () => getHomeMetrics()),
});

export { metricsRouter };
