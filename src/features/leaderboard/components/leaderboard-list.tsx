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

async function LeaderboardList() {
  "use cache";
  cacheLife("hours");

  const { entries, totalSubmissions, averageScore } =
    await getCaller().leaderboard.list({ limit: 20 });

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="font-primary text-4xl font-bold text-accent-green">
            {">"}
          </span>
          <h1 className="font-primary text-4xl font-bold text-text-primary">
            shame_leaderboard
          </h1>
        </div>

        <p className="font-secondary text-sm text-text-secondary">
          {"// o codigo mais tostado da internet"}
        </p>

        <div className="flex items-center gap-2 font-secondary text-xs text-text-tertiary">
          <span>{totalSubmissions.toLocaleString("pt-BR")} submissions</span>
          <span>·</span>
          <span>avg score: {averageScore.toFixed(1)}/10</span>
        </div>
      </header>

      {entries.length === 0 ? (
        <section className="flex flex-col gap-5" aria-label="Leaderboard">
          <div className="border border-border-primary px-5 py-6 font-secondary text-xs text-text-tertiary">
            no roasts yet. be the first to get roasted.
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-5" aria-label="Leaderboard">
          <Table>
            <TableHeader>
              <TableHeader.Cell className="w-10">#</TableHeader.Cell>
              <TableHeader.Cell className="w-15">score</TableHeader.Cell>
              <TableHeader.Cell className="flex-1">snippet</TableHeader.Cell>
              <TableHeader.Cell className="w-25 text-right">
                action
              </TableHeader.Cell>
            </TableHeader>

            {entries.map((entry, index) => (
              <LeaderboardRowCollapsible
                key={entry.roastId}
                rank={index + 1}
                score={entry.score}
                scoreClassName={getScoreColor(entry.score)}
                language={entry.language}
                snippet={entry.code.split("\n")[0] ?? ""}
                codeSlot={
                  <CodeBlock code={entry.code} language={entry.language} />
                }
              />
            ))}
          </Table>
        </section>
      )}
    </div>
  );
}

export { LeaderboardList };
