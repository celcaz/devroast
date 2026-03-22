import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = ComponentProps<"div">;

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-bg-surface", className)} {...props} />
  );
}

export type { SkeletonProps };
export { Skeleton };
