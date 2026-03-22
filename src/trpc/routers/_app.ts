import { router } from "@/trpc/init";
import { metricsRouter } from "@/trpc/routers/metrics";

const appRouter = router({
  metrics: metricsRouter,
});

type AppRouter = typeof appRouter;

export type { AppRouter };
export { appRouter };
