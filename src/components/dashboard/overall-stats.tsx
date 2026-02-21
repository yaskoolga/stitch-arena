"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeedBadge } from "@/components/achievements/speed-badge";
import { ActivityHeatmap } from "./activity-heatmap";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";

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

export function OverallStats() {
  const t = useTranslations('dashboard.stats');

  const { data, isLoading, error } = useQuery<OverallStatsData>({
    queryKey: ["overall-stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats/overall");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{t('failedToLoad')}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <Card className="gap-1 py-3">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('totalProjects')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-0">
            <div className="text-2xl font-bold">{data.projectCounts.total}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {data.projectCounts.active} {t('active')} · {data.projectCounts.completed} {t('completed')}
              {data.projectCounts.paused > 0 && ` · ${data.projectCounts.paused} ${t('paused')}`}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-1 py-3">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('totalStitches')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-0">
            <div className="text-2xl font-bold">
              {data.totalStitches.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t('acrossAll')}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-1 py-3">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('averageSpeed')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-0">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold">{data.avgSpeed}</div>
              <SpeedBadge avgStitchesPerDay={data.avgSpeed} size="sm" />
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t('stitchesPerDaySixMonths')}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-1 py-3">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('mostProductive')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-0">
            {data.mostProductiveDay ? (
              <>
                <div className="text-2xl font-bold">
                  {data.mostProductiveDay.count.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(data.mostProductiveDay.date), "MMM d, yyyy")}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">{t('noDataYet')}</div>
            )}
          </CardContent>
        </Card>

        <Card className="gap-1 py-3">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              🔥 {t('currentStreak')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-0">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {data.currentStreak}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {data.currentStreak === 1 ? t('dayInARow') : t('daysInARow')}
            </div>
            {data.bestStreak > data.currentStreak && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {t('best')}: {data.bestStreak} {data.bestStreak === 1 ? t('day') : t('days')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>{t('activityOverview')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap data={data.heatmapData} months={12} />
        </CardContent>
      </Card>

      {/* Top Projects */}
      {data.topProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('topProjects')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProjects.map((project, index) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-muted-foreground w-8">
                      #{index + 1}
                    </div>
                    {project.schemaImage && (
                      <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={project.schemaImage}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate group-hover:text-primary transition-colors">
                        {project.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.completedStitches.toLocaleString()} /{" "}
                        {project.totalStitches.toLocaleString()} {t('stitches')}
                      </div>
                      <Progress value={project.progress} className="h-1 mt-1" />
                    </div>
                    <div className="text-sm font-medium">
                      {project.progress.toFixed(1)}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
