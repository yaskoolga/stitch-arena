"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface StatsCardsProps {
  totalStitches: number;
  completedStitches: number;
  totalLogs: number;
  firstLogDate?: string;
}

export function StatsCards({ totalStitches, completedStitches, totalLogs, firstLogDate }: StatsCardsProps) {
  const t = useTranslations();
  const pct = totalStitches > 0 ? Math.round((completedStitches / totalStitches) * 100) : 0;

  let daysSinceStart = 0;
  let avgPerDay = 0;
  let daysRemaining: number | null = null;

  if (firstLogDate && totalLogs > 0) {
    daysSinceStart = Math.max(1, Math.ceil((Date.now() - new Date(firstLogDate).getTime()) / (1000 * 60 * 60 * 24)));
    avgPerDay = Math.round(completedStitches / daysSinceStart);
    if (avgPerDay > 0) {
      daysRemaining = Math.ceil((totalStitches - completedStitches) / avgPerDay);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="gap-1 py-3 rounded-2xl bg-primary/5 border-primary/10 shadow-sm">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-xs font-medium text-primary">{t("projects.progress.title")}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          <p className="text-2xl font-bold text-primary">{pct}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">{completedStitches.toLocaleString()} / {totalStitches.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card className="gap-1 py-3 rounded-2xl bg-success/5 border-success/10 shadow-sm">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-xs font-medium text-success">{t("projects.progress.days")}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          <p className="text-2xl font-bold text-success">{daysSinceStart > 0 ? daysSinceStart : "—"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{totalLogs} {t("projects.progress.logs")}</p>
        </CardContent>
      </Card>
      <Card className="gap-1 py-3 rounded-2xl bg-info/5 border-info/10 shadow-sm">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-xs font-medium text-info">{t("projects.progress.avgPerDay")}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          <p className="text-2xl font-bold text-info">{avgPerDay.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card className="gap-1 py-3 rounded-2xl bg-warning/5 border-warning/10 shadow-sm">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-xs font-medium text-warning">{t("projects.progress.estDaysLeft")}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-0">
          <p className="text-2xl font-bold text-warning">{daysRemaining !== null ? daysRemaining : "—"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
