import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const diffLineVariants = cva(
  "flex gap-2 px-4 py-2 font-primary text-[13px] font-normal w-full",
  {
    variants: {
      variant: {
        added: "bg-[#0A1A0F] text-text-primary",
        removed: "bg-[#1A0A0A] text-text-secondary",
        context: "text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "context",
    },
  },
);

const prefixMap = {
  added: "+",
  removed: "-",
  context: " ",
} as const;

const prefixColorMap = {
  added: "text-accent-green",
  removed: "text-accent-red",
  context: "text-text-tertiary",
} as const;

type DiffLineProps = ComponentProps<"div"> &
  VariantProps<typeof diffLineVariants>;

function DiffLine({
  className,
  variant = "context",
  children,
  ...props
}: DiffLineProps) {
  const resolvedVariant = variant ?? "context";

  return (
    <div className={cn(diffLineVariants({ variant, className }))} {...props}>
      <span className={cn("select-none", prefixColorMap[resolvedVariant])}>
        {prefixMap[resolvedVariant]}
      </span>
      <span>{children}</span>
    </div>
  );
}

export type { DiffLineProps };
export { DiffLine, diffLineVariants };
