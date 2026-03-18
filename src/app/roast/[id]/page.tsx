import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";

type RoastIssue = {
  id: string;
  severity: "critical" | "warning" | "good";
  title: string;
  description: string;
};

type RoastDiffLine = {
  id: string;
  variant: "context" | "removed" | "added";
  content: string;
};

type RoastDetailsData = {
  score: number;
  verdict: string;
  roastQuote: string;
  language: string;
  lineCount: number;
  code: string;
  issues: RoastIssue[];
  diffLines: RoastDiffLine[];
};

const staticRoastData: RoastDetailsData = {
  score: 3.5,
  verdict: "needs_serious_help",
  roastQuote:
    '"this code looks like it was written during a power outage... in 2005."',
  language: "javascript",
  lineCount: 16,
  code: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  if (total > 100) {
    console.log("discount applied");
    total = total * 0.9;
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`,
  issues: [
    {
      id: "issue-1",
      severity: "critical",
      title: "using var instead of const/let",
      description:
        "var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
    },
    {
      id: "issue-2",
      severity: "warning",
      title: "imperative loop pattern",
      description:
        "for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
    },
    {
      id: "issue-3",
      severity: "good",
      title: "clear naming conventions",
      description:
        "calculateTotal and items are descriptive names that communicate intent without extra comments.",
    },
    {
      id: "issue-4",
      severity: "good",
      title: "single responsibility",
      description:
        "the function does one thing well: calculates a total. no hidden side effects and no mixed concerns.",
    },
  ],
  diffLines: [
    {
      id: "line-1",
      variant: "context",
      content: "function calculateTotal(items) {",
    },
    { id: "line-2", variant: "removed", content: "  var total = 0;" },
    {
      id: "line-3",
      variant: "removed",
      content: "  for (var i = 0; i < items.length; i++) {",
    },
    {
      id: "line-4",
      variant: "removed",
      content: "    total = total + items[i].price;",
    },
    { id: "line-5", variant: "removed", content: "  }" },
    { id: "line-6", variant: "removed", content: "  return total;" },
    {
      id: "line-7",
      variant: "added",
      content: "  return items.reduce((sum, item) => sum + item.price, 0);",
    },
    { id: "line-8", variant: "context", content: "}" },
  ],
};

function toBadgeVariant(
  severity: RoastIssue["severity"],
): "critical" | "warning" | "good" {
  return severity;
}

function verdictToneClass(verdict: string): string {
  if (verdict === "needs_serious_help" || verdict === "legendary_disaster") {
    return "text-accent-red";
  }

  if (verdict === "mediocre_at_best") {
    return "text-accent-amber";
  }

  return "text-accent-green";
}

type RoastPageParams = {
  id: string;
};

type RoastPageProps = {
  params: Promise<RoastPageParams>;
};

export async function generateMetadata({
  params,
}: RoastPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Roast ${id} | DevRoast`,
    description: `Analise detalhada e score do roast ${id} no DevRoast.`,
  };
}

export default async function RoastDetailsPage({ params }: RoastPageProps) {
  const { id } = await params;
  const roast = staticRoastData;

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-8 md:flex-row md:items-center">
        <ScoreRing score={roast.score} className="shrink-0" />

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="critical">verdict: {roast.verdict}</Badge>
          </div>

          <p className="font-secondary text-xl leading-8 text-text-primary">
            {roast.roastQuote}
          </p>

          <div className="flex flex-wrap items-center gap-3 font-primary text-xs text-text-tertiary">
            <span>lang: {roast.language}</span>
            <span>·</span>
            <span>{roast.lineCount} lines</span>
            <span>·</span>
            <span>roast id: {id}</span>
          </div>

          <div className="pt-1">
            <Button variant="outline" size="sm">
              $ share_roast
            </Button>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-border-secondary" />

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="font-primary text-sm font-bold text-accent-green">
            {"//"}
          </span>
          <h2 className="font-primary text-sm font-bold text-text-primary">
            your_submission
          </h2>
        </div>

        <div className="border border-border-primary">
          <CodeBlock code={roast.code} />
        </div>
      </section>

      <div className="h-px w-full bg-border-secondary" />

      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <span className="font-primary text-sm font-bold text-accent-green">
            {"//"}
          </span>
          <h2 className="font-primary text-sm font-bold text-text-primary">
            detailed_analysis
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {roast.issues.map((issue) => (
            <Card key={issue.id} className="gap-3 p-5">
              <Badge variant={toBadgeVariant(issue.severity)}>
                {issue.severity}
              </Badge>
              <CardTitle>{issue.title}</CardTitle>
              <CardDescription className="leading-[1.5]">
                {issue.description}
              </CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-border-secondary" />

      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <span className="font-primary text-sm font-bold text-accent-green">
            {"//"}
          </span>
          <h2 className="font-primary text-sm font-bold text-text-primary">
            suggested_fix
          </h2>
        </div>

        <div className="border border-border-primary bg-bg-input">
          <div className="flex h-10 items-center border-b border-border-primary px-4">
            <span className="font-primary text-xs font-medium text-text-secondary">
              your_code.ts -&gt; improved_code.ts
            </span>
          </div>

          <div className="flex flex-col py-1">
            {roast.diffLines.map((line) => (
              <DiffLine key={line.id} variant={line.variant}>
                {line.content}
              </DiffLine>
            ))}
          </div>
        </div>

        <p
          className={`font-secondary text-xs ${verdictToneClass(roast.verdict)}`}
        >
          {
            "// dados estaticos por enquanto; em breve esta pagina buscara o roast real pelo id"
          }
        </p>
      </section>
    </div>
  );
}
