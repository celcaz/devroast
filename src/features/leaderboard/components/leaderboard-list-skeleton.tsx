import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader } from "@/components/ui/table-row";

function LeaderboardListSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-hidden>
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-6" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-3 w-48" />
      </header>

      <section className="flex flex-col gap-5">
        <Table>
          <TableHeader>
            <TableHeader.Cell className="w-10">#</TableHeader.Cell>
            <TableHeader.Cell className="w-15">score</TableHeader.Cell>
            <TableHeader.Cell className="flex-1">snippet</TableHeader.Cell>
            <TableHeader.Cell className="w-25 text-right">
              action
            </TableHeader.Cell>
          </TableHeader>

          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={`leaderboard-skeleton-${index.toString()}`}
              className="flex items-center border-b border-border-primary px-5 py-4"
            >
              <Skeleton className="h-3 w-6" />
              <Skeleton className="ml-4 h-3 w-9" />
              <Skeleton className="ml-4 h-3 flex-1" />
              <Skeleton className="ml-4 h-3 w-20" />
            </div>
          ))}
        </Table>
      </section>
    </div>
  );
}

export { LeaderboardListSkeleton };
