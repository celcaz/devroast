import { getHomeLeaderboard } from "@/features/leaderboard/queries/get-home-leaderboard";
import { publicProcedure, router } from "@/trpc/init";

const leaderboardRouter = router({
  homepage: publicProcedure.query(async () => getHomeLeaderboard()),
});

export { leaderboardRouter };
