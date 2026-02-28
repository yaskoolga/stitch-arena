"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, Flame, Target } from "lucide-react";
import { ACHIEVEMENTS, RARITY_CONFIG } from "@/lib/constants";
import type { Level } from "@/lib/levels";

interface Achievement {
  id: string;
  rarity: string;
  emoji: string;
  requirement: number;
  progress: number;
  isUnlocked: boolean;
}

interface Stats {
  totalStitches: number;
  currentStreak: number;
  bestStreak: number;
  level: {
    current: Level;
    next: Level | null;
    progress: number;
    stitchesUntilNext: number;
    stitchesInCurrentLevel: number;
  };
}

export function GamificationOverview() {
  const t = useTranslations();
  const tLevels = useTranslations("levels");
  const tAch = useTranslations("achievements");

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["stats-overall"],
    queryFn: async () => {
      const res = await fetch("/api/stats/overall");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: achievements, isLoading: achLoading } = useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: async () => {
      const res = await fetch("/api/achievements");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data.achievements || [];
    },
  });

  if (statsLoading || achLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  // Find next achievement to unlock (locked achievements sorted by progress %)
  const lockedAchievements = achievements
    ?.filter((a) => !a.isUnlocked && a.requirement > 0)
    .map((a) => ({
      ...a,
      progressPercent: (a.progress / a.requirement) * 100,
    }))
    .sort((a, b) => b.progressPercent - a.progressPercent) || [];

  const nextAchievement = lockedAchievements[0];
  const nextAchievementDef = nextAchievement
    ? Object.values(ACHIEVEMENTS).find((a) => a.id === nextAchievement.id)
    : null;

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-start gap-4">
          {/* Level Progress - Left Side */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-medium text-muted-foreground">
                {t("dashboard.gamification")}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{stats.level.current.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {tLevels(`names.${stats.level.current.name}`)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {tLevels("title")} {stats.level.current.level}
                </p>
              </div>
              {stats.level.next && (
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium">{stats.level.progress}%</p>
                </div>
              )}
            </div>
            {stats.level.next ? (
              <Progress value={stats.level.progress} className="h-1.5" />
            ) : (
              <p className="text-[10px] text-muted-foreground">{tLevels("maxLevel")}</p>
            )}
          </div>

          {/* Vertical Divider */}
          {nextAchievement && nextAchievementDef && (
            <div className="h-auto w-px bg-border shrink-0" />
          )}

          {/* Next Achievement - Right Side */}
          {nextAchievement && nextAchievementDef && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {t("dashboard.nextAchievement")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    RARITY_CONFIG[nextAchievementDef.rarity as keyof typeof RARITY_CONFIG]?.bgColor || "bg-muted"
                  } opacity-60 grayscale`}
                >
                  <span className="text-lg">{nextAchievementDef.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {tAch(`list.${nextAchievementDef.id}.name`)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Progress value={nextAchievement.progressPercent} className="h-1.5 flex-1" />
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                      {Math.round(nextAchievement.progressPercent)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
