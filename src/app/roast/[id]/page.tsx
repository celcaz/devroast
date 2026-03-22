import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";
import { getRoastById } from "@/features/roast/queries/get-roast-by-id";

type RoastDiffLine = {
  id: string;
  variant: "context" | "removed" | "added";
  content: string;
};

function toBadgeVariant(severity: "critical" | "warning" | "good") {
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

async function RoastDetailsContent({ params }: RoastPageProps) {
  const { id } = await params;
  const roast = await getRoastById(id);

  if (!roast) {
    notFound();
  }

  const diffLines: RoastDiffLine[] = roast.suggestedFix
    ? roast.suggestedFix
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line, index) => ({
          id: `fix-${index + 1}`,
          variant: "added",
          content: line,
        }))
    : [
        {
          id: "fix-empty",
          variant: "context",
          content: "// no suggested fix provided",
        },
      ];

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
            <span className="font-primary text-xs text-text-tertiary">
              {"// share_roast fora do escopo da v1"}
            </span>
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
            {diffLines.map((line) => (
              <DiffLine key={line.id} variant={line.variant}>
                {line.content}
              </DiffLine>
            ))}
          </div>
        </div>

        <p
          className={`font-secondary text-xs ${verdictToneClass(roast.verdict)}`}
        >
          {"// roast real carregado do banco"}
        </p>
      </section>
    </div>
  );
}

export default function RoastDetailsPage({ params }: RoastPageProps) {
  return (
    <Suspense fallback={<div className="min-h-80" />}>
      <RoastDetailsContent params={params} />
    </Suspense>
  );
}
