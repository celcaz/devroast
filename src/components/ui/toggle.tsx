"use client";

import { Switch } from "@base-ui/react/switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ToggleProps = ComponentProps<typeof Switch.Root> & {
  label?: string;
};

function Toggle({ className, label, ...props }: ToggleProps) {
  return (
    <div className="inline-flex items-center gap-3 font-primary">
      <Switch.Root
        className={cn(
          "group flex h-[22px] w-10 cursor-pointer items-center rounded-full border-none bg-border-primary p-[3px] transition-colors data-[checked]:bg-accent-green",
          className,
        )}
        {...props}
      >
        <Switch.Thumb className="size-4 rounded-full bg-text-secondary transition-transform data-[checked]:translate-x-[18px] data-[checked]:bg-bg-page" />
      </Switch.Root>
      {label && (
        <span className="text-xs text-text-secondary group-has-[data-[checked]]:text-accent-green">
          {label}
        </span>
      )}
    </div>
  );
}

export type { ToggleProps };
export { Toggle };
