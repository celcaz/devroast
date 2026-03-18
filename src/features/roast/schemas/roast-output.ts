type RoastIssueOutput = {
  severity: "critical" | "warning" | "good";
  title: string;
  description: string;
};

type RoastOutput = {
  score: number;
  verdict:
    | "legendary_disaster"
    | "needs_serious_help"
    | "mediocre_at_best"
    | "getting_there"
    | "actually_decent";
  roastQuote: string;
  issues: RoastIssueOutput[];
  suggestedFix: string;
};

export type { RoastIssueOutput, RoastOutput };
