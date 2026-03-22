import { cacheLife } from "next/cache";
import { CodeBlock } from "@/components/ui/code-block";
import { Table, TableHeader } from "@/components/ui/table-row";
import { LeaderboardRowCollapsible } from "@/features/leaderboard/components/leaderboard-row-collapsible";
import { getCaller } from "@/trpc/server";

function getScoreColor(score: number): string {
  if (score <= 2.5) {
    return "text-accent-red";
  }

  if (score <= 4.5) {
    return "text-accent-amber";
  }

  return "text-accent-green";
}

async function HomeLeaderboard() {
  "use cache";
  cacheLife("hours");

  const { entries, totalRoasts } = await getCaller().leaderboard.homepage();

  if (entries.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Table>
          <TableHeader>
            <TableHeader.Cell className="w-10">#</TableHeader.Cell>
            <TableHeader.Cell className="w-15">score</TableHeader.Cell>
            <TableHeader.Cell className="flex-1">code</TableHeader.Cell>
            <TableHeader.Cell className="w-25">lang</TableHeader.Cell>
          </TableHeader>
          <div className="px-5 py-6 font-secondary text-xs text-text-tertiary">
            no roasts yet. be the first to get roasted.
          </div>
        </Table>

        <p className="text-center font-secondary text-xs text-text-tertiary">
          showing top 0 of 0
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableHeader.Cell className="w-10">#</TableHeader.Cell>
          <TableHeader.Cell className="w-15">score</TableHeader.Cell>
          <TableHeader.Cell className="flex-1">snippet</TableHeader.Cell>
          <TableHeader.Cell className="w-25 text-right">
            action
          </TableHeader.Cell>
        </TableHeader>

        {entries.map((entry) => (
          <LeaderboardRowCollapsible
            key={entry.roastId}
            rank={entry.rank}
            score={entry.score}
            scoreClassName={getScoreColor(entry.score)}
            language={entry.language}
            snippet={entry.code.split("\n")[0] ?? ""}
            codeSlot={<CodeBlock code={entry.code} language={entry.language} />}
          />
        ))}
      </Table>

      <p className="text-center font-secondary text-xs text-text-tertiary">
        showing top {entries.length} of {totalRoasts.toLocaleString("pt-BR")} ·
        view full leaderboard &gt;&gt;
      </p>
    </div>
  );
}

export { HomeLeaderboard };
