import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type TableRowProps = ComponentProps<"div"> & {
  rank: string;
  score: string;
  scoreColor?: string;
  codePreview: string;
  language: string;
};

function TableRow({
  className,
  rank,
  score,
  scoreColor = "text-accent-red",
  codePreview,
  language,
  ...props
}: TableRowProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-6 border-b border-border-primary px-5 py-4 font-primary",
        className,
      )}
      {...props}
    >
      <span className="w-10 shrink-0 text-[13px] text-text-tertiary">
        {rank}
      </span>
      <span className={cn("w-15 shrink-0 text-[13px] font-bold", scoreColor)}>
        {score}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">
        {codePreview}
      </span>
      <span className="w-25 shrink-0 text-right text-xs text-text-tertiary">
        {language}
      </span>
    </div>
  );
}

export type { TableRowProps };
export { TableRow };
