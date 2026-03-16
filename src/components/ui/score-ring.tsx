import { cn } from "@/lib/utils";

type ScoreRingProps = {
  score: number;
  maxScore?: number;
  size?: number;
  className?: string;
};

function ScoreRing({
  score,
  maxScore = 10,
  size = 180,
  className,
}: ScoreRingProps) {
  const radius = (size - 8) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(score / maxScore, 1);

  // The arc goes from 12 o'clock (top) clockwise
  // strokeDasharray = filled portion + gap
  const arcLength = circumference * percentage;
  const gapLength = circumference - arcLength;

  return (
    <div
      className={cn("relative font-primary", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
      >
        <title>Score ring</title>
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border-primary)"
          strokeWidth={4}
        />

        {/* Gradient arc */}
        <defs>
          <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-green)" />
            <stop offset="100%" stopColor="var(--accent-amber)" />
          </linearGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#score-gradient)"
          strokeWidth={4}
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>

      {/* Center score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-5xl font-bold leading-none text-text-primary">
          {score}
        </span>
        <span className="text-base leading-none text-text-tertiary">
          /{maxScore}
        </span>
      </div>
    </div>
  );
}

export type { ScoreRingProps };
export { ScoreRing };
