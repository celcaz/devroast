import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type CardProps = ComponentProps<"div">;

function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border border-border-primary p-5 font-primary",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type CardTitleProps = ComponentProps<"p">;

function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <p
      className={cn("text-[13px] font-normal text-text-primary", className)}
      {...props}
    />
  );
}

type CardDescriptionProps = ComponentProps<"p">;

function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn(
        "font-secondary text-xs leading-6 text-text-secondary",
        className,
      )}
      {...props}
    />
  );
}

export type { CardDescriptionProps, CardProps, CardTitleProps };
export { Card, CardDescription, CardTitle };
