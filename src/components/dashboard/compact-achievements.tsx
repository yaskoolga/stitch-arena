"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { ACHIEVEMENTS } from "@/lib/constants";

interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  requirement: number;
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
            {unlocked.map((achievement) => (
              <Tooltip key={achievement.id}>
                <TooltipTrigger>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <span className="text-2xl">{achievement.emoji}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                      ✓ {t(`list.${achievement.id}.name`)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t(`list.${achievement.id}.description`)}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Разделитель */}
            {unlocked.length > 0 && locked.length > 0 && (
              <div className="flex items-center shrink-0">
                <div className="w-px h-6 bg-border" />
              </div>
            )}

            {/* Невыполненные достижения */}
            {locked.map((achievement) => (
              <Tooltip key={achievement.id}>
                <TooltipTrigger>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center opacity-30 grayscale">
                    <span className="text-2xl">{achievement.emoji}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold">
                      {t(`list.${achievement.id}.name`)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t(`list.${achievement.id}.description`)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {t("progress")}: {achievement.progress.toLocaleString()} /{" "}
                      {achievement.requirement.toLocaleString()}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
