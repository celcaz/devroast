import { Table, TableHeader, TableRow } from "@/components/ui/table-row";
import { CodeInputSection } from "@/features/roast/components/code-input-section";
import { HomeMetrics } from "@/features/roast/components/home-metrics";

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="font-primary text-4xl font-bold text-accent-green">
            $
          </span>
          <h1 className="font-primary text-4xl font-bold text-text-primary">
            paste your code. get roasted.
          </h1>
        </div>
        <p className="font-secondary text-sm text-text-secondary">
          {
            "// drop your code below and we'll rate it — brutally honest or full roast mode"
          }
        </p>
      </div>

      {/* Code Input */}
      <CodeInputSection metricsSlot={<HomeMetrics />} />

      {/* Leaderboard Preview */}
      <div className="flex flex-col gap-6">
        {/* Section title */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-primary text-sm font-bold text-accent-green">
                {"//"}
              </span>
              <span className="font-primary text-sm font-bold text-text-primary">
                shame_leaderboard
              </span>
            </div>
            <a
              href="/leaderboard"
              className="border border-border-primary px-3 py-1.5 font-primary text-xs text-text-secondary transition-colors hover:text-text-primary"
            >
              $ view_all &gt;&gt;
            </a>
          </div>
          <p className="font-secondary text-[13px] text-text-tertiary">
            {"// the worst code on the internet, ranked by shame"}
          </p>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableHeader.Cell className="w-10">#</TableHeader.Cell>
            <TableHeader.Cell className="w-15">score</TableHeader.Cell>
            <TableHeader.Cell className="flex-1">code</TableHeader.Cell>
            <TableHeader.Cell className="w-25">lang</TableHeader.Cell>
          </TableHeader>
          <TableRow>
            <TableRow.Rank>1</TableRow.Rank>
            <TableRow.Score className="text-accent-red">1.2</TableRow.Score>
            <TableRow.Code>
              eval(prompt(&quot;enter code&quot;)) · document.write(response) ·{" "}
              {"// trust the user lol"}
            </TableRow.Code>
            <TableRow.Language>javascript</TableRow.Language>
          </TableRow>
          <TableRow>
            <TableRow.Rank>2</TableRow.Rank>
            <TableRow.Score className="text-accent-red">1.8</TableRow.Score>
            <TableRow.Code>
              if (x == true) {"{ return true; }"} else if (x == false){" "}
              {"{ return false; }"} else {"{ return !false; }"}
            </TableRow.Code>
            <TableRow.Language>typescript</TableRow.Language>
          </TableRow>
          <TableRow>
            <TableRow.Rank>3</TableRow.Rank>
            <TableRow.Score className="text-accent-red">2.1</TableRow.Score>
            <TableRow.Code>
              SELECT * FROM users WHERE 1=1 --{"{ TODO: add authentication }"}
            </TableRow.Code>
            <TableRow.Language>sql</TableRow.Language>
          </TableRow>
        </Table>

        {/* Fade hint */}
        <p className="text-center font-secondary text-xs text-text-tertiary">
          showing top 3 of 2,847 · view full leaderboard &gt;&gt;
        </p>
      </div>
    </div>
  );
}
