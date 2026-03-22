import { z } from "zod";
import { getHomeLeaderboard } from "@/features/leaderboard/queries/get-home-leaderboard";
import { getLeaderboard } from "@/features/leaderboard/queries/get-leaderboard";
import { publicProcedure, router } from "@/trpc/init";

const leaderboardRouter = router({
  homepage: publicProcedure.query(async () => getHomeLeaderboard()),
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(20).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      return getLeaderboard(input?.limit ?? 20);
    }),
});

export { leaderboardRouter };
