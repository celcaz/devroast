import { z } from "zod";

const roastIssueOutputSchema = z.object({
  severity: z.enum(["critical", "warning", "good"]),
  title: z.string().min(1),
  description: z.string().min(1),
});

const roastOutputSchema = z.object({
  score: z.number().min(0).max(10),
  verdict: z.enum([
    "legendary_disaster",
    "needs_serious_help",
    "mediocre_at_best",
    "getting_there",
    "actually_decent",
  ]),
  roastQuote: z.string().min(1),
  issues: z.array(roastIssueOutputSchema),
  suggestedFix: z.string().min(1),
});

type RoastIssueOutput = z.infer<typeof roastIssueOutputSchema>;
type RoastOutput = z.infer<typeof roastOutputSchema>;

export type { RoastIssueOutput, RoastOutput };
export { roastIssueOutputSchema, roastOutputSchema };
