"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import type { ReactNode } from "react";
import { useState } from "react";
import { TableRow } from "@/components/ui/table-row";
import { cn } from "@/lib/utils";

type LeaderboardRowCollapsibleProps = {
  rank: number;
  score: number;
  scoreClassName: string;
  language: string;
  snippet: string;
  codeSlot: ReactNode;
};

function LeaderboardRowCollapsible({
  rank,
  score,
  scoreClassName,
  language,
  snippet,
  codeSlot,
}: LeaderboardRowCollapsibleProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible.Root className="w-full" open={open} onOpenChange={setOpen}>
      <TableRow className="border-b border-border-primary">
        <TableRow.Rank>{rank}</TableRow.Rank>
        <TableRow.Score className={scoreClassName}>
          {score.toFixed(1)}
        </TableRow.Score>
        <TableRow.Code className="truncate text-text-tertiary">
          {snippet}
        </TableRow.Code>
        <TableRow.Language className="flex items-center justify-end gap-3">
          <span className="text-text-tertiary">{language}</span>
          <Collapsible.Trigger className="cursor-pointer text-accent-green transition-colors hover:text-accent-green/80">
            {open ? `collapse #${rank}` : `view #${rank}`}
          </Collapsible.Trigger>
        </TableRow.Language>
      </TableRow>

      <div className="relative">
        <Collapsible.Panel
          className={cn(
            "overflow-hidden border-b border-border-primary transition-[max-height] duration-300 ease-out",
            open ? "max-h-[900px]" : "max-h-[132px]",
          )}
          keepMounted
        >
          {codeSlot}
        </Collapsible.Panel>

        {!open && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg-input to-transparent" />
        )}
      </div>
    </Collapsible.Root>
  );
}

export type { LeaderboardRowCollapsibleProps };
export { LeaderboardRowCollapsible };
