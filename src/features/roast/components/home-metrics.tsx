import { AnimatedMetricNumber } from "@/features/roast/components/animated-metric-number";
import { getCaller } from "@/trpc/server";

async function HomeMetrics() {
  const metrics = await getCaller().metrics.homepage();

  return (
    <div className="flex items-center justify-center gap-6">
      <span className="font-secondary text-xs text-text-tertiary">
        <AnimatedMetricNumber
          value={metrics.totalRoastedCodes}
          format={{ useGrouping: true }}
        />{" "}
        codes roasted
      </span>
      <span className="font-primary text-xs text-text-tertiary">·</span>
      <span className="font-secondary text-xs text-text-tertiary">
        avg score:{" "}
        <AnimatedMetricNumber
          value={metrics.averageScore}
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        />
        /10
      </span>
    </div>
  );
}

export { HomeMetrics };
