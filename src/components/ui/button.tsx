import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium font-primary cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-green text-bg-page hover:bg-accent-green/80 focus-visible:ring-accent-green",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary",
        outline:
          "border border-border-primary bg-transparent text-foreground hover:bg-bg-elevated focus-visible:ring-border-focus",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-bg-elevated hover:text-foreground",
        destructive:
          "bg-destructive text-bg-page hover:bg-destructive/80 focus-visible:ring-destructive",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export type { ButtonProps };
export { Button, buttonVariants };
