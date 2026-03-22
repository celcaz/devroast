import { router } from "@/trpc/init";
import { leaderboardRouter } from "@/trpc/routers/leaderboard";
import { metricsRouter } from "@/trpc/routers/metrics";

const appRouter = router({
  leaderboard: leaderboardRouter,
  metrics: metricsRouter,
});

type AppRouter = typeof appRouter;

export type { AppRouter };
export { appRouter };
