import { faker } from "@faker-js/faker";
import { config } from "dotenv";
import { roastIssues, roasts, submissions } from "@/db/schema";

config({ path: ".env.local" });
config();

const TOTAL_ROASTS = 100;
const MIN_CODE_LINES = 8;

const issueTitles = {
  critical: [
    "unsafe input handling",
    "hardcoded credentials",
    "sql injection risk",
    "missing error handling",
    "blocking sync operation",
  ],
  warning: [
    "long function body",
    "duplicated logic",
    "unclear naming",
    "weak typing choices",
    "no test coverage",
  ],
  good: [
    "good early return",
    "readable structure",
    "helpful variable naming",
    "sane defaults",
    "clean function split",
  ],
} as const;

const roastQuotes = [
  "this code looks like it was merged during a fire drill",
  "bold strategy, shipping hope-driven development",
  "i have questions, and none of them are comfortable",
  "this function does everything except therapy",
  "it works, but at what emotional cost",
  "this logic is one refactor away from peace",
  "your future self already opened a bug report",
  "the compiler passed, the reviewer cried",
  "i admire the confidence, not the implementation",
  "this is technically code, spiritually a warning",
];

const codeSamples: Record<string, string[]> = {
  javascript: [
    "const users = await fetch('/api/users').then(r => r.json());\nusers.map(u => console.log(u.name));",
    "function calc(a, b) {\n  if (a == null) return b;\n  return a + b;\n}",
  ],
  typescript: [
    "type User = { id: string; name: string };\nconst byId: Record<string, User> = {};",
    "function parse(input: unknown): string {\n  return String(input).trim();\n}",
  ],
  python: [
    "def total(items):\n    s = 0\n    for i in items:\n        s += i\n    return s",
    "users = [u for u in data if u.get('active')]\nprint(len(users))",
  ],
  rust: [
    'fn greet(name: &str) -> String {\n    format!("hello {}", name)\n}',
    "let values = vec![1,2,3];\nlet sum: i32 = values.iter().sum();",
  ],
  go: [
    "func sum(items []int) int {\n  total := 0\n  for _, v := range items { total += v }\n  return total\n}",
    "if err != nil {\n  return err\n}",
  ],
  java: [
    "public int sum(List<Integer> items) {\n  return items.stream().mapToInt(i -> i).sum();\n}",
    "if (value == null) {\n  throw new IllegalArgumentException();\n}",
  ],
  cpp: [
    "int sum(const std::vector<int>& v){\n  int s = 0;\n  for (int n : v) s += n;\n  return s;\n}",
    'std::cout << "hello" << std::endl;',
  ],
  c: [
    "int sum(int* arr, int n){\n  int s=0;\n  for(int i=0;i<n;i++) s+=arr[i];\n  return s;\n}",
    'printf("done\\n");',
  ],
  csharp: [
    "var names = users.Select(u => u.Name).ToList();",
    "if (string.IsNullOrWhiteSpace(input)) return;",
  ],
  php: [
    "$users = array_filter($users, fn($u) => $u['active']);",
    "function sum($items) { return array_sum($items); }",
  ],
  ruby: [
    "users = data.select { |u| u[:active] }",
    "def total(items)\n  items.sum\nend",
  ],
  swift: [
    "let names = users.map { $0.name }",
    "func total(_ items: [Int]) -> Int { items.reduce(0, +) }",
  ],
  kotlin: [
    "val names = users.map { it.name }",
    "fun total(items: List<Int>) = items.sum()",
  ],
  sql: [
    "SELECT id, email FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC;",
    "UPDATE users SET last_login = NOW() WHERE id = $1;",
  ],
  html: [
    "<main><h1>DevRoast</h1><p>paste your code</p></main>",
    '<button type="button">Roast</button>',
  ],
  css: [
    ".card { display: grid; gap: 8px; padding: 16px; }",
    ".title { color: var(--color-text-primary); font-weight: 700; }",
  ],
  json: [
    '{"name":"devroast","enabled":true,"retries":3}',
    '{"users":[{"id":1,"name":"Ana"}],"count":1}',
  ],
  yaml: [
    "service:\n  name: devroast\n  replicas: 2",
    "env:\n  NODE_ENV: production\n  LOG_LEVEL: info",
  ],
  bash: [
    "#!/usr/bin/env bash\nset -euo pipefail\npm run build\npm run start",
    'for f in src/*.ts; do\n  echo "$f"\ndone',
  ],
  markdown: [
    "# DevRoast\n\nPaste your code and get roasted.",
    "## TODO\n\n- improve linting\n- add leaderboard",
  ],
  plaintext: [
    "just some plain text pretending to be code",
    "notes from code review: too many side effects",
  ],
};

function pickLanguage() {
  return faker.helpers.arrayElement(submissions.language.enumValues);
}

const longCodeSamples: Record<string, string[]> = {
  javascript: [
    "async function getLeaderboard(client) {\n  const rows = await client.query('SELECT id, score FROM roasts ORDER BY score ASC LIMIT 20');\n  return rows.rows.map((row, index) => ({\n    rank: index + 1,\n    id: row.id,\n    score: Number(row.score),\n  }));\n}\n\nexport { getLeaderboard };",
  ],
  typescript: [
    "type Roast = { id: string; score: number; language: string };\n\nfunction normalizeRoasts(rows: Roast[]) {\n  return rows\n    .filter((row) => row.score >= 0)\n    .sort((a, b) => a.score - b.score)\n    .slice(0, 20)\n    .map((row, index) => ({ ...row, rank: index + 1 }));\n}\n\nexport { normalizeRoasts };",
  ],
  python: [
    "def worst_scores(items):\n    valid = [item for item in items if item.get('score') is not None]\n    ordered = sorted(valid, key=lambda item: item['score'])\n    top = ordered[:20]\n    result = []\n    for index, item in enumerate(top, start=1):\n        result.append({**item, 'rank': index})\n    return result",
  ],
  rust: [
    "fn worst_scores(mut scores: Vec<f32>) -> Vec<(usize, f32)> {\n    scores.sort_by(|a, b| a.partial_cmp(b).unwrap());\n    let mut result = Vec::new();\n    for (index, score) in scores.iter().take(20).enumerate() {\n        result.push((index + 1, *score));\n    }\n    result\n}\n\nfn main() {\n    let _data = worst_scores(vec![2.1, 4.0, 1.3]);\n}",
  ],
  go: [
    "func WorstScores(scores []float64) []float64 {\n  sort.Float64s(scores)\n  limit := 20\n  if len(scores) < limit {\n    limit = len(scores)\n  }\n  result := make([]float64, 0, limit)\n  for i := 0; i < limit; i++ {\n    result = append(result, scores[i])\n  }\n  return result\n}",
  ],
  java: [
    "public List<Double> worstScores(List<Double> scores) {\n  return scores.stream()\n    .filter(Objects::nonNull)\n    .sorted()\n    .limit(20)\n    .map(score -> Math.round(score * 10.0) / 10.0)\n    .collect(Collectors.toList());\n}\n\npublic void logTop(List<Double> scores) {\n  System.out.println(worstScores(scores));\n}",
  ],
  cpp: [
    'std::vector<double> worstScores(std::vector<double> scores) {\n  std::sort(scores.begin(), scores.end());\n  if (scores.size() > 20) {\n    scores.resize(20);\n  }\n  for (size_t i = 0; i < scores.size(); ++i) {\n    std::cout << i + 1 << ": " << scores[i] << std::endl;\n  }\n  return scores;\n}',
  ],
  c: [
    'void print_worst_scores(double *scores, int count) {\n  for (int i = 0; i < count - 1; i++) {\n    for (int j = i + 1; j < count; j++) {\n      if (scores[j] < scores[i]) {\n        double temp = scores[i];\n        scores[i] = scores[j];\n        scores[j] = temp;\n      }\n    }\n  }\n  for (int i = 0; i < count && i < 20; i++) printf("%d %.1f\\n", i + 1, scores[i]);\n}',
  ],
  csharp: [
    'public static IReadOnlyList<double> WorstScores(IEnumerable<double> scores)\n{\n    return scores\n        .Where(score => score >= 0)\n        .OrderBy(score => score)\n        .Take(20)\n        .Select(score => Math.Round(score, 1))\n        .ToList();\n}\n\nConsole.WriteLine(string.Join(", ", WorstScores(new[] { 2.1, 1.4, 9.0 })));',
  ],
  php: [
    "<?php\nfunction worst_scores(array $scores): array {\n  sort($scores);\n  $top = array_slice($scores, 0, 20);\n  $result = [];\n  foreach ($top as $index => $score) {\n    $result[] = ['rank' => $index + 1, 'score' => round($score, 1)];\n  }\n  return $result;\n}\n",
  ],
  ruby: [
    "def worst_scores(scores)\n  normalized = scores.compact.map(&:to_f)\n  ordered = normalized.sort\n  top = ordered.take(20)\n  top.each_with_index.map do |score, index|\n    { rank: index + 1, score: score.round(1) }\n  end\nend\n\nputs worst_scores([2.1, 1.9, 4.0]).inspect",
  ],
  swift: [
    "func worstScores(_ scores: [Double]) -> [(Int, Double)] {\n  let ordered = scores.sorted()\n  let top = Array(ordered.prefix(20))\n  return top.enumerated().map { index, score in\n    (index + 1, (score * 10).rounded() / 10)\n  }\n}\n\nlet result = worstScores([2.1, 1.1, 9.9])\nprint(result)",
  ],
  kotlin: [
    "fun worstScores(scores: List<Double>): List<Pair<Int, Double>> {\n  return scores\n    .filter { it >= 0 }\n    .sorted()\n    .take(20)\n    .mapIndexed { index, score ->\n      Pair(index + 1, kotlin.math.round(score * 10) / 10)\n    }\n}\n\nprintln(worstScores(listOf(2.1, 1.4, 5.7)))",
  ],
  sql: [
    "WITH ranked_roasts AS (\n  SELECT\n    r.id,\n    r.score,\n    s.language,\n    ROW_NUMBER() OVER (ORDER BY r.score ASC, r.created_at ASC) AS rank\n  FROM roasts r\n  JOIN submissions s ON s.id = r.submission_id\n)\nSELECT id, score, language, rank\nFROM ranked_roasts\nWHERE rank <= 20;",
  ],
  html: [
    '<section class="leaderboard">\n  <header>\n    <h1>Shame Leaderboard</h1>\n    <p>Top 20 worst scores</p>\n  </header>\n  <ol>\n    <li data-rank="1">score: 1.2</li>\n    <li data-rank="2">score: 1.8</li>\n  </ol>\n</section>',
  ],
  css: [
    ".leaderboard {\n  display: grid;\n  gap: 12px;\n  padding: 16px;\n  border: 1px solid var(--color-border-primary);\n}\n\n.leaderboard__row {\n  display: grid;\n  grid-template-columns: 40px 80px 1fr 120px;\n  align-items: center;\n}",
  ],
  json: [
    '{\n  "leaderboard": [\n    { "rank": 1, "score": 1.2, "language": "javascript" },\n    { "rank": 2, "score": 1.8, "language": "typescript" }\n  ],\n  "total": 20,\n  "averageScore": 4.2,\n  "generatedAt": "2026-03-22T12:00:00Z"\n}',
  ],
  yaml: [
    "leaderboard:\n  limit: 20\n  sort:\n    by: score\n    direction: asc\n  entries:\n    - rank: 1\n      score: 1.2\n      language: javascript\n    - rank: 2\n      score: 1.8\n      language: typescript",
  ],
  bash: [
    '#!/usr/bin/env bash\nset -euo pipefail\n\npsql "$DATABASE_URL" <<\'SQL\'\nSELECT id, score\nFROM roasts\nORDER BY score ASC, created_at ASC\nLIMIT 20;\nSQL\n\necho "done"',
  ],
  markdown: [
    "# Shame Leaderboard\n\n## Rules\n\n- Sort by lower score first\n- Show up to 20 entries\n- Keep full code available\n\n## Notes\n\nUse SSR and suspense for loading states.",
  ],
  plaintext: [
    "leaderboard job started\nreading submissions table\njoining roasts table\nsorting by score ascending\nlimiting output to 20 rows\nnormalizing score values\nbuilding response payload\nrequest completed successfully",
  ],
};

function lineCount(code: string) {
  return code.replace(/\r\n/g, "\n").split("\n").length;
}

function buildCode(language: (typeof submissions.language.enumValues)[number]) {
  const samples = codeSamples[language] ?? codeSamples.plaintext;
  const sample = faker.helpers.arrayElement(samples);

  if (lineCount(sample) >= MIN_CODE_LINES) {
    return sample;
  }

  const realisticSamples =
    longCodeSamples[language] ?? longCodeSamples.plaintext;
  return faker.helpers.arrayElement(realisticSamples);
}

function scoreToVerdict(
  score: number,
): (typeof roasts.verdict.enumValues)[number] {
  if (score < 2) return "legendary_disaster";
  if (score < 4) return "needs_serious_help";
  if (score < 6) return "mediocre_at_best";
  if (score < 8) return "getting_there";
  return "actually_decent";
}

async function seed() {
  faker.seed(4242);

  const { db, pool } = await import("@/db");

  await db.delete(submissions);

  for (let i = 0; i < TOTAL_ROASTS; i++) {
    const language = pickLanguage();
    const code = buildCode(language);
    const lineCount = code.split("\n").length;

    const [submission] = await db
      .insert(submissions)
      .values({
        code,
        language,
        lineCount,
      })
      .returning({ id: submissions.id });

    const score = faker.number.float({ min: 0, max: 10, multipleOf: 0.1 });
    const verdict = scoreToVerdict(score);

    const [roast] = await db
      .insert(roasts)
      .values({
        submissionId: submission.id,
        score: score.toFixed(1),
        verdict,
        roastQuote: faker.helpers.arrayElement(roastQuotes),
        suggestedFix: buildCode(language),
        modelUsed: faker.helpers.arrayElement([
          "gpt-4o-mini",
          "claude-haiku-4-5",
          "gemini-2.5-flash",
        ]),
      })
      .returning({ id: roasts.id });

    const issueCount = faker.number.int({ min: 2, max: 5 });
    const issues = Array.from({ length: issueCount }, (_, index) => {
      const severity = faker.helpers.weightedArrayElement([
        { weight: 4, value: "warning" as const },
        { weight: 3, value: "critical" as const },
        { weight: 2, value: "good" as const },
      ]);

      const title = faker.helpers.arrayElement(issueTitles[severity]);

      return {
        roastId: roast.id,
        severity,
        title,
        description: faker.lorem.sentence({ min: 8, max: 16 }),
        order: index,
      };
    });

    await db.insert(roastIssues).values(issues);
  }

  console.log(`Seed completed with ${TOTAL_ROASTS} roasts.`);
  await pool.end();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
