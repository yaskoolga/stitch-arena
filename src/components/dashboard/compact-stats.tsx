"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { StatsCard } from "@/components/design";
import { Card, CardContent } from "@/components/ui/card";
import { SpeedBadge } from "@/components/achievements/speed-badge";
import { format } from "date-fns";
import { FolderOpen, Activity, Zap, TrendingUp, Flame } from "lucide-react";

interface OverallStatsData {
  projectCounts: {
    total: number;
    active: number;
    completed: number;
    paused: number;
  };
  totalStitches: number;
  mostProductiveDay: { date: string; count: number } | null;
  mostProductiveWeek: {
    startDate: string;
    endDate: string;
    count: number;
  } | null;
  avgSpeed: number;
  currentStreak: number;
  bestStreak: number;
  topProjects: Array<{
    id: string;
    title: string;
    schemaImage: string | null;
    totalStitches: number;
    completedStitches: number;
    progress: number;
  }>;
  heatmapData: Array<{ date: string; count: number }>;
}

interface CompactStatsProps {
  userId?: string;  // If not specified - current user
}

export function CompactStats({ userId }: CompactStatsProps) {
  const t = useTranslations("dashboard.stats");

  // Determine which endpoint to use
  const statsEndpoint = userId ? `/api/stats/user/${userId}` : '/api/stats/overall';

  const { data, isLoading, error } = useQuery<OverallStatsData>({
    queryKey: ["overall-stats", userId],
    queryFn: async () => {
      const res = await fetch(statsEndpoint);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (error) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <p className="text-destructive">{t("failedToLoad")}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="rounded-2xl animate-pulse">
            <CardContent className="p-3">
              <div className="h-16"></div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  const activePercentage = data.projectCounts.total > 0
    ? Math.round((data.projectCounts.active / data.projectCounts.total) * 100)
    : 0;

  return (
    <>
      <StatsCard
        title={t("totalProjects")}
        value={data.projectCounts.total}
        description={`${data.projectCounts.active} ${t("active")} · ${data.projectCounts.completed} ${t("completed")}`}
        icon={FolderOpen}
        color="primary"
      />

      <StatsCard
        title={t("totalStitches")}
        value={data.totalStitches}
        description={t("acrossAll")}
        icon={Activity}
        color="success"
      />

      <StatsCard
        title={t("averageSpeed")}
        value={data.avgSpeed}
        description={t("stitchesPerDaySixMonths")}
        icon={Zap}
        color="info"
      />

      <StatsCard
        title={t("mostProductive")}
        value={data.mostProductiveDay ? data.mostProductiveDay.count : 0}
        description={data.mostProductiveDay
          ? format(new Date(data.mostProductiveDay.date), "MMM d, yyyy")
          : t("noDataYet")
        }
        icon={TrendingUp}
        color="warning"
      />

      <StatsCard
        title={t("currentStreak")}
        value={`${data.currentStreak} ${data.currentStreak === 1 ? t("day") : t("days")}`}
        description={data.bestStreak > data.currentStreak
          ? `${t("best")}: ${data.bestStreak} ${data.bestStreak === 1 ? t("day") : t("days")}`
          : t("daysInARow")
        }
        icon={Flame}
        color="success"
      />
    </>
  );
}
