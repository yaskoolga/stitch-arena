"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award, X } from "lucide-react";
import { ACHIEVEMENTS, RARITY_CONFIG, type AchievementRarity } from "@/lib/constants";
import { toast } from "sonner";

interface Achievement {
  id: string;
  rarity: AchievementRarity;
  emoji: string;
  unlockedAt: string | null;
}

interface TitleSelectorProps {
  currentTitle?: string | null;
}

export function TitleSelector({ currentTitle }: TitleSelectorProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("achievements");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  // Fetch user's achievements
  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: async () => {
      const res = await fetch("/api/achievements");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data.achievements || [];
    },
  });

  // Mutation to update title
  const updateTitle = useMutation({
    mutationFn: async (achievementId: string | null) => {
      const res = await fetch("/api/profile/title", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementId }),
      });
      if (!res.ok) throw new Error("Failed to update title");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Title updated successfully");
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to update title");
    },
  });

  const unlockedAchievements = achievements?.filter((a) => a.unlockedAt) || [];

  const handleSelectTitle = (achievementId: string | null) => {
    updateTitle.mutate(achievementId);
  };

  const currentAchievement = currentTitle
    ? Object.values(ACHIEVEMENTS).find((a) => a.id === currentTitle)
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Award className="h-4 w-4" />
          {currentTitle ? tCommon("changeTitle") : tCommon("selectTitle")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tCommon("selectTitle")}</DialogTitle>
          <DialogDescription>
            Choose an achievement to display as your title
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current title */}
          {currentTitle && currentAchievement && (
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentAchievement.emoji}</span>
                <div>
                  <p className="text-sm font-medium">
                    {t(`list.${currentAchievement.id}.name`)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tCommon("currentTitle")}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSelectTitle(null)}
                disabled={updateTitle.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Available titles */}
          <div>
            <p className="text-sm font-medium mb-2">
              {tCommon("availableTitles")} ({unlockedAchievements.length})
            </p>
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {unlockedAchievements.map((achievement) => {
                  const achievementDef = Object.values(ACHIEVEMENTS).find(
                    (a) => a.id === achievement.id
                  );
                  if (!achievementDef) return null;

                  const rarityConfig = RARITY_CONFIG[achievementDef.rarity];
                  const isSelected = currentTitle === achievement.id;

                  return (
                    <TooltipProvider key={achievement.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleSelectTitle(achievement.id)}
                            disabled={updateTitle.isPending || isSelected}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                              isSelected
                                ? "bg-primary/10 border-primary"
                                : "hover:bg-muted/50 hover:border-muted-foreground/20"
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${rarityConfig.bgColor} ring-1 ring-inset ring-black/5 dark:ring-white/10`}
                            >
                              <span className="text-xl">{achievementDef.emoji}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {t(`list.${achievementDef.id}.name`)}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px]">{rarityConfig.emoji}</span>
                                <span
                                  className={`text-[10px] font-medium ${rarityConfig.color}`}
                                >
                                  {rarityConfig.name}
                                </span>
                              </div>
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {t(`list.${achievementDef.id}.description`)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {unlockedAchievements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{tCommon("noUnlockedAchievements")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
