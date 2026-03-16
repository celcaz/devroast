import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 font-primary font-normal text-xs transition-colors",
  {
    variants: {
      variant: {
        critical: "text-accent-red",
        warning: "text-accent-amber",
        good: "text-accent-green",
      },
    },
    defaultVariants: {
      variant: "critical",
    },
  },
);

const dotVariants = cva("size-2 rounded-full shrink-0", {
  variants: {
    variant: {
      critical: "bg-accent-red",
      warning: "bg-accent-amber",
      good: "bg-accent-green",
    },
  },
  defaultVariants: {
    variant: "critical",
  },
});

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      <span className={dotVariants({ variant })} />
      {children}
    </span>
  );
}

export type { BadgeProps };
export { Badge, badgeVariants };
