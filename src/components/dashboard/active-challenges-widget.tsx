/**
 * Active Challenges Widget for Dashboard - Compact Version
 * Shows user's active challenges count as a small card
 */

"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/design";
import { Trophy } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  type: "speed" | "streak" | "completion";
  targetValue: number;
  startDate: string;
  endDate: string;
}

interface ActiveChallengesWidgetProps {
  userId?: string;
}

export function ActiveChallengesWidget({ userId }: ActiveChallengesWidgetProps) {
  const t = useTranslations();

  // Fetch user's active challenges
  const { data: challenges, isLoading } = useQuery({
    queryKey: ["active-challenges"],
    queryFn: async () => {
      const res = await fetch(`/api/challenges?status=active`);
      if (!res.ok) throw new Error("Failed to fetch challenges");
      const json = await res.json();
      return json.data as Challenge[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !userId, // Only fetch for own dashboard
  });

  const activeCount = challenges?.length || 0;

  if (isLoading) {
    return null; // Don't show while loading
  }

  const description = activeCount === 0
    ? t("dashboard.activeChallenges.browse") // "Browse challenges"
    : t("dashboard.activeChallenges.viewAll"); // "View all"

  return (
    <Link href="/challenges" className="block">
      <StatsCard
        title={t("dashboard.activeChallenges.title")}
        value={activeCount}
        description={description}
        icon={Trophy}
        color="primary"
      />
    </Link>
  );
}
