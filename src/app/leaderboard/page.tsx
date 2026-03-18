import type { Metadata } from "next";
import { CodeBlock } from "@/components/ui/code-block";

export const metadata: Metadata = {
  title: "Shame Leaderboard | DevRoast",
  description:
    "Veja os piores trechos de codigo do DevRoast e o nivel de vergonha de cada submissao.",
};

export const dynamic = "force-dynamic";

type LeaderboardEntry = {
  id: string;
  rank: number;
  score: number;
  language: string;
  lineCount: number;
  code: string;
};

const leaderboardEntries: LeaderboardEntry[] = [
  {
    id: "entry-1",
    rank: 1,
    score: 1.2,
    language: "javascript",
    lineCount: 14,
    code: `function login(user, pass) {
  if (user == "admin" && pass == "123456") {
    return true;
  }

  return user == "root" ? true : false;
}`,
  },
  {
    id: "entry-2",
    rank: 2,
    score: 1.8,
    language: "typescript",
    lineCount: 11,
    code: `async function getData(url: string) {
  const data = await fetch(url).then((r) => r.json());
  const parsed = JSON.parse(JSON.stringify(data));
  return parsed || {};
}`,
  },
  {
    id: "entry-3",
    rank: 3,
    score: 2.1,
    language: "sql",
    lineCount: 6,
    code: `SELECT *
FROM users
WHERE 1=1
  AND email = '\${email}'
  AND password = '\${password}';`,
  },
  {
    id: "entry-4",
    rank: 4,
    score: 2.4,
    language: "python",
    lineCount: 9,
    code: `def divide(a, b):
    try:
        return a / b
    except:
        return 0

print(divide(10, 0))`,
  },
  {
    id: "entry-5",
    rank: 5,
    score: 2.9,
    language: "php",
    lineCount: 10,
    code: `$query = "SELECT * FROM users WHERE id = " . $_GET["id"];
$result = mysqli_query($db, $query);

while ($row = mysqli_fetch_assoc($result)) {
  echo $row["name"];
}`,
  },
];

function formatScore(score: number): string {
  return score.toFixed(1);
}

function getScoreColor(score: number): string {
  if (score <= 2.5) {
    return "text-accent-red";
  }

  if (score <= 4.5) {
    return "text-accent-amber";
  }

  return "text-accent-green";
}

export default async function LeaderboardPage() {
  const totalSubmissions = 2847;
  const averageScore = 4.2;

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

      <section className="flex flex-col gap-5" aria-label="Leaderboard">
        {leaderboardEntries.map((entry) => (
          <article key={entry.id} className="border border-border-primary">
            <div className="flex h-12 items-center justify-between border-b border-border-primary px-5">
              <div className="flex items-center gap-4 font-primary">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] text-text-tertiary">#</span>
                  <span className="text-[14px] font-bold text-accent-amber">
                    {entry.rank}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-text-tertiary">score:</span>
                  <span className={getScoreColor(entry.score)}>
                    {formatScore(entry.score)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 font-primary">
                <span className="text-xs text-text-secondary">
                  {entry.language}
                </span>
                <span className="text-xs text-text-tertiary">
                  {entry.lineCount} lines
                </span>
              </div>
            </div>

            <CodeBlock code={entry.code} />
          </article>
        ))}
      </section>
    </div>
  );
}
