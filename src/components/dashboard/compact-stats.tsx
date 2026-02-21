"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeedBadge } from "@/components/achievements/speed-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

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
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{t("failedToLoad")}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2 px-3 pt-3">
              <Skeleton className="h-3 w-20" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <Skeleton className="h-6 w-14" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      <Card className="gap-1 py-2">
        <CardHeader className="px-3 pb-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            {t("totalProjects")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-0">
          <div className="text-xl font-bold">{data.projectCounts.total}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {data.projectCounts.active} {t("active")} · {data.projectCounts.completed}{" "}
            {t("completed")}
            {data.projectCounts.paused > 0 &&
              ` · ${data.projectCounts.paused} ${t("paused")}`}
          </div>
        </CardContent>
      </Card>

      <Card className="gap-1 py-2">
        <CardHeader className="px-3 pb-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            {t("totalStitches")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-0">
          <div className="text-xl font-bold">
            {data.totalStitches.toLocaleString()}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {t("acrossAll")}
          </div>
        </CardContent>
      </Card>

      <Card className="gap-1 py-2">
        <CardHeader className="px-3 pb-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            {t("averageSpeed")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-0">
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold">{data.avgSpeed}</div>
            <SpeedBadge avgStitchesPerDay={data.avgSpeed} size="sm" />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {t("stitchesPerDaySixMonths")}
          </div>
        </CardContent>
      </Card>

      <Card className="gap-1 py-2">
        <CardHeader className="px-3 pb-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            {t("mostProductive")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-0">
          {data.mostProductiveDay ? (
            <>
              <div className="text-xl font-bold">
                {data.mostProductiveDay.count.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {format(new Date(data.mostProductiveDay.date), "MMM d, yyyy")}
              </div>
            </>
          ) : (
            <div className="text-xs text-muted-foreground">{t("noDataYet")}</div>
          )}
        </CardContent>
      </Card>

      <Card className="gap-1 py-2">
        <CardHeader className="px-3 pb-0">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            🔥 {t("currentStreak")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-0">
          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
            {data.currentStreak}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {data.currentStreak === 1 ? t("dayInARow") : t("daysInARow")}
          </div>
          {data.bestStreak > data.currentStreak && (
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {t("best")}: {data.bestStreak} {data.bestStreak === 1 ? t("day") : t("days")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
