"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityHeatmap } from "./activity-heatmap";
import { useTranslations } from "next-intl";

export function ActivityHeatmapCard() {
  const t = useTranslations("dashboard.stats");

  const { data: stats } = useQuery({
    queryKey: ["overall-stats"],
    queryFn: () => fetch("/api/stats/overall").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Card>
      <CardHeader className="pb-3 px-3 pt-3">
        <CardTitle className="text-lg">{t("activityOverview")}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <ActivityHeatmap data={stats?.heatmapData || []} months={12} />
      </CardContent>
    </Card>
  );
}
