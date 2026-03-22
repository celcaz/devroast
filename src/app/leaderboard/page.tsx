import type { Metadata } from "next";
import { Suspense } from "react";
import { LeaderboardList } from "@/features/leaderboard/components/leaderboard-list";
import { LeaderboardListSkeleton } from "@/features/leaderboard/components/leaderboard-list-skeleton";

export const metadata: Metadata = {
  title: "Shame Leaderboard | DevRoast",
  description:
    "Veja os piores trechos de codigo do DevRoast e o nivel de vergonha de cada submissao.",
};

export default async function LeaderboardPage() {
  return (
    <Suspense fallback={<LeaderboardListSkeleton />}>
      <LeaderboardList />
    </Suspense>
  );
}
