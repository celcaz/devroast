import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// ─── Table ────────────────────────────────────────────────────────────────────

type TableProps = ComponentProps<"div">;

function Table({ className, ...props }: TableProps) {
  return (
    <div
      className={cn("border border-border-primary font-primary", className)}
      {...props}
    />
  );
}

// ─── TableHeader ──────────────────────────────────────────────────────────────

type TableHeaderProps = ComponentProps<"div">;

function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <div
      className={cn("flex h-10 items-center bg-bg-surface px-5", className)}
      {...props}
    />
  );
}

type TableHeaderCellProps = ComponentProps<"span">;

function TableHeaderCell({ className, ...props }: TableHeaderCellProps) {
  return (
    <span
      className={cn("text-xs font-medium text-text-tertiary", className)}
      {...props}
    />
  );
}

TableHeader.Cell = TableHeaderCell;

// ─── TableRow ─────────────────────────────────────────────────────────────────

type TableRowProps = ComponentProps<"div">;

function TableRow({ className, ...props }: TableRowProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center border-b border-border-primary px-5 py-4 font-primary last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

type TableRowRankProps = ComponentProps<"span">;

function TableRowRank({ className, ...props }: TableRowRankProps) {
  return (
    <span
      className={cn("w-10 shrink-0 text-[13px] text-text-tertiary", className)}
      {...props}
    />
  );
}

type TableRowScoreProps = ComponentProps<"span">;

function TableRowScore({ className, ...props }: TableRowScoreProps) {
  return (
    <span
      className={cn("w-15 shrink-0 text-[13px] font-bold", className)}
      {...props}
    />
  );
}

type TableRowCodeProps = ComponentProps<"span">;

function TableRowCode({ className, ...props }: TableRowCodeProps) {
  return (
    <span
      className={cn(
        "min-w-0 flex-1 truncate text-xs text-text-secondary",
        className,
      )}
      {...props}
    />
  );
}

type TableRowLanguageProps = ComponentProps<"span">;

function TableRowLanguage({ className, ...props }: TableRowLanguageProps) {
  return (
    <span
      className={cn(
        "w-25 shrink-0 text-right text-xs text-text-tertiary",
        className,
      )}
      {...props}
    />
  );
}

TableRow.Rank = TableRowRank;
TableRow.Score = TableRowScore;
TableRow.Code = TableRowCode;
TableRow.Language = TableRowLanguage;

// ─── Exports ──────────────────────────────────────────────────────────────────

export type {
  TableHeaderCellProps,
  TableHeaderProps,
  TableProps,
  TableRowCodeProps,
  TableRowLanguageProps,
  TableRowProps,
  TableRowRankProps,
  TableRowScoreProps,
};
export { Table, TableHeader, TableRow };
