"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityHeatmap } from "./activity-heatmap";
import { useTranslations } from "next-intl";

interface ActivityHeatmapCardProps {
  userId?: string;  // If not specified - current user
}

export function ActivityHeatmapCard({ userId }: ActivityHeatmapCardProps) {
  const t = useTranslations("dashboard.stats");

  // Determine which endpoint to use
  const statsEndpoint = userId ? `/api/stats/user/${userId}` : '/api/stats/overall';

  const { data: stats } = useQuery({
    queryKey: ["overall-stats", userId],
    queryFn: () => fetch(statsEndpoint).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3 px-3 pt-3">
        <CardTitle className="text-lg">{t("activityOverview")}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <ActivityHeatmap data={stats?.heatmapData || []} months={12} />
      </CardContent>
    </Card>
  );
}
