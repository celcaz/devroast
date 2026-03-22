import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader } from "@/components/ui/table-row";

function HomeLeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <Table>
        <TableHeader>
          <TableHeader.Cell className="w-10">#</TableHeader.Cell>
          <TableHeader.Cell className="w-15">score</TableHeader.Cell>
          <TableHeader.Cell className="flex-1">code</TableHeader.Cell>
          <TableHeader.Cell className="w-25">lang</TableHeader.Cell>
        </TableHeader>

        <div className="flex items-center border-b border-border-primary px-5 py-4">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="ml-4 h-3 w-9" />
          <Skeleton className="ml-4 h-3 flex-1" />
          <Skeleton className="ml-4 h-3 w-20" />
        </div>

        <div className="flex items-center border-b border-border-primary px-5 py-4">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="ml-4 h-3 w-9" />
          <Skeleton className="ml-4 h-3 flex-1" />
          <Skeleton className="ml-4 h-3 w-20" />
        </div>

        <div className="flex items-center px-5 py-4">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="ml-4 h-3 w-9" />
          <Skeleton className="ml-4 h-3 flex-1" />
          <Skeleton className="ml-4 h-3 w-20" />
        </div>
      </Table>

      <Skeleton className="mx-auto h-3 w-56" />
    </div>
  );
}

export { HomeLeaderboardSkeleton };
