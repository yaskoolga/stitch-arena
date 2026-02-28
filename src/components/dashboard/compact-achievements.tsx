"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";
import { ACHIEVEMENTS, RARITY_CONFIG, type AchievementRarity } from "@/lib/constants";

interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  requirement: number;
  rarity: AchievementRarity;
  isUnlocked: boolean;
  progress: number;
  unlockedAt: string | null;
}

export function CompactAchievements() {
  const t = useTranslations("achievements");

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: async () => {
      const res = await fetch("/api/achievements");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data.achievements || [];
    },
  });

  const unlocked = achievements?.filter((a) => a.unlockedAt) || [];
  const locked = achievements?.filter((a) => !a.unlockedAt) || [];
  const total = Object.values(ACHIEVEMENTS).length;

  return (
    <Card>
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t("title")}</CardTitle>
          <span className="text-xs text-muted-foreground">
            {unlocked.length}/{total}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <TooltipProvider>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {/* Выполненные достижения */}
            {unlocked.map((achievement) => {
              const rarityConfig = RARITY_CONFIG[achievement.rarity];
              return (
                <Tooltip key={achievement.id}>
                  <TooltipTrigger>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${rarityConfig.bgColor} ring-1 ring-inset ring-black/5 dark:ring-white/10`}>
                      <span className="text-2xl">{achievement.emoji}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                          ✓ {t(`list.${achievement.id}.name`)}
                        </p>
                        <span className="text-[10px]">{rarityConfig.emoji}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {t(`list.${achievement.id}.description`)}
                      </p>
                      <p className={`text-[9px] font-medium ${rarityConfig.color}`}>
                        {rarityConfig.name}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* Разделитель */}
            {unlocked.length > 0 && locked.length > 0 && (
              <div className="flex items-center shrink-0">
                <div className="w-px h-6 bg-border" />
              </div>
            )}

            {/* Невыполненные достижения */}
            {locked.map((achievement) => {
              const rarityConfig = RARITY_CONFIG[achievement.rarity];
              const progressPercent = Math.min(100, (achievement.progress / achievement.requirement) * 100);
              return (
                <Tooltip key={achievement.id}>
                  <TooltipTrigger>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/30 ring-1 ring-inset ring-border/50 opacity-50 grayscale">
                      <span className="text-2xl">{achievement.emoji}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold">
                          {t(`list.${achievement.id}.name`)}
                        </p>
                        <span className="text-[10px] opacity-50">{rarityConfig.emoji}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {t(`list.${achievement.id}.description`)}
                      </p>
                      <p className={`text-[9px] font-medium ${rarityConfig.color} opacity-70`}>
                        {rarityConfig.name}
                      </p>
                      <div className="space-y-0.5 pt-1">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="text-muted-foreground">{t("progress")}</span>
                          <span className="text-muted-foreground">
                            {achievement.progress.toLocaleString()} / {achievement.requirement.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-1" />
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
