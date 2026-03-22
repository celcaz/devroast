import { Suspense } from "react";
import { HomeLeaderboard } from "@/features/leaderboard/components/home-leaderboard";
import { HomeLeaderboardSkeleton } from "@/features/leaderboard/components/home-leaderboard-skeleton";
import { CodeInputSection } from "@/features/roast/components/code-input-section";
import { HomeMetrics } from "@/features/roast/components/home-metrics";

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="font-primary text-4xl font-bold text-accent-green">
            $
          </span>
          <h1 className="font-primary text-4xl font-bold text-text-primary">
            paste your code. get roasted.
          </h1>
        </div>
        <p className="font-secondary text-sm text-text-secondary">
          {
            "// drop your code below and we'll rate it — brutally honest or full roast mode"
          }
        </p>
      </div>

      {/* Code Input */}
      <CodeInputSection metricsSlot={<HomeMetrics />} />

      {/* Leaderboard Preview */}
      <div className="flex flex-col gap-6">
        {/* Section title */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-primary text-sm font-bold text-accent-green">
                {"//"}
              </span>
              <span className="font-primary text-sm font-bold text-text-primary">
                shame_leaderboard
              </span>
            </div>
            <a
              href="/leaderboard"
              className="border border-border-primary px-3 py-1.5 font-primary text-xs text-text-secondary transition-colors hover:text-text-primary"
            >
              $ view_all &gt;&gt;
            </a>
          </div>
          <p className="font-secondary text-[13px] text-text-tertiary">
            {"// the worst code on the internet, ranked by shame"}
          </p>
        </div>

        <Suspense fallback={<HomeLeaderboardSkeleton />}>
          <HomeLeaderboard />
        </Suspense>
      </div>
    </div>
  );
}
