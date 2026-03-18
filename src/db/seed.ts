import { faker } from "@faker-js/faker";
import { config } from "dotenv";
import { roastIssues, roasts, submissions } from "@/db/schema";

config({ path: ".env.local" });
config();

const TOTAL_ROASTS = 100;

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

function buildCode(language: (typeof submissions.language.enumValues)[number]) {
  const samples = codeSamples[language] ?? codeSamples.plaintext;
  return faker.helpers.arrayElement(samples);
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
