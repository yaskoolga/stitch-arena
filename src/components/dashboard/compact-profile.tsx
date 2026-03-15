"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { format } from "date-fns";
import { User, Calendar } from "lucide-react";
import { ACHIEVEMENTS, RARITY_CONFIG, type AchievementRarity } from "@/lib/constants";
import type { Level } from "@/lib/levels";
import { UserTitle } from "@/components/profile/user-title";
import { TitleSelector } from "@/components/profile/title-selector";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  selectedTitle: string | null;
  createdAt: string;
}

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

interface Stats {
  level: {
    current: Level;
    next: Level | null;
    progress: number;
    stitchesUntilNext: number;
    stitchesInCurrentLevel: number;
  };
}

interface CompactProfileProps {
  userId?: string;  // If not specified - current user
  isOwn?: boolean;  // Is this the current user's profile?
}

export function CompactProfile({ userId, isOwn = true }: CompactProfileProps) {
  const t = useTranslations();
  const tAch = useTranslations("achievements");
  const tLevels = useTranslations("levels");
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  // Determine which endpoint to use based on userId and isOwn
  const profileEndpoint = userId && !isOwn ? `/api/users/${userId}` : '/api/profile';
  const achievementsEndpoint = userId && !isOwn
    ? `/api/users/${userId}/achievements`
    : '/api/achievements';

  const { data: user } = useQuery<UserProfile>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res = await fetch(profileEndpoint);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["achievements", userId],
    queryFn: async () => {
      const res = await fetch(achievementsEndpoint);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data.achievements || [];
    },
  });

  // Fetch level info (only for own profile)
  const { data: stats } = useQuery<Stats>({
    queryKey: ["stats-overall", userId],
    queryFn: async () => {
      const res = await fetch('/api/stats/overall');
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isOwn, // Only fetch for own profile
  });

  const unlocked = achievements?.filter((a) => a.unlockedAt) || [];
  const locked = achievements?.filter((a) => !a.unlockedAt) || [];
  const total = Object.values(ACHIEVEMENTS).length;

  // Filter achievements to show: all unlocked + top 5 nearest to unlock
  const getFilteredAchievements = () => {
    if (showAllAchievements) {
      return { unlocked, locked };
    }

    // Sort locked achievements by progress (higher progress = closer to unlock)
    const sortedLocked = [...locked].sort((a, b) => {
      const progressA = (a.progress / a.requirement) * 100;
      const progressB = (b.progress / b.requirement) * 100;
      return progressB - progressA;
    });

    // Take top 5 closest to unlock
    const nearestLocked = sortedLocked.slice(0, 5);

    return { unlocked, locked: nearestLocked };
  };

  const { unlocked: displayedUnlocked, locked: displayedLocked } = getFilteredAchievements();
  const hiddenCount = locked.length - displayedLocked.length;

  if (!user) return null;

  return (
    <Card className="rounded-2xl">
      <CardContent className="px-3 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Профиль слева */}
          <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
            <Avatar className="h-12 w-12 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-sm bg-gradient-to-br from-primary/20 to-primary/10">
                {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                  {user.name || "Anonymous"}
                </p>
                {user.selectedTitle && (
                  <UserTitle achievementId={user.selectedTitle} size="sm" />
                )}
              </div>
              {isOwn && (
                <p className="text-xs sm:text-[11px] text-muted-foreground truncate">{user.email}</p>
              )}
              <div className="flex items-center gap-1 mt-0.5">
                <Calendar className="h-2.5 w-2.5 text-muted-foreground" />
                <span className="text-[11px] sm:text-[11px] text-muted-foreground">
                  {t("common.memberSince")} {format(new Date(user.createdAt), "MMM yyyy")}
                </span>
              </div>
            </div>
            <User className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
          </Link>

          {/* Вертикальный разделитель */}
          <div className="hidden sm:block h-12 w-px bg-border shrink-0" />

          {/* Уровень (только для собственного профиля) */}
          {isOwn && stats?.level && (
            <>
              <div className="w-full sm:min-w-[140px] sm:w-auto">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xl">{stats.level.current.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">
                      {tLevels(`names.${stats.level.current.name}`)}
                    </p>
                    <p className="text-[11px] sm:text-[11px] text-muted-foreground">
                      {tLevels("title")} {stats.level.current.level}
                    </p>
                  </div>
                </div>
                {stats.level.next ? (
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px] sm:text-[11px]">
                      <span className="text-muted-foreground">{stats.level.progress}%</span>
                      <span className="text-muted-foreground">
                        {stats.level.stitchesUntilNext.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={stats.level.progress} className="h-1 rounded-full" aria-label={`Level progress: ${stats.level.progress}%`} />
                  </div>
                ) : (
                  <p className="text-[11px] sm:text-[11px] text-muted-foreground">{tLevels("maxLevel")}</p>
                )}
              </div>

              {/* Вертикальный разделитель */}
              <div className="hidden sm:block h-12 w-px bg-border shrink-0" />
            </>
          )}

          {/* Достижения и титулы справа */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{tAch("title")}</span>
                <span className="text-[11px] text-muted-foreground">
                  {unlocked.length}/{total}
                </span>
              </div>
              {isOwn && unlocked.length > 0 && (
                <TitleSelector currentTitle={user.selectedTitle} />
              )}
            </div>
            <TooltipProvider>
              <div>
                <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                  {/* Выполненные достижения */}
                  {displayedUnlocked.map((achievement) => {
                    const rarityConfig = RARITY_CONFIG[achievement.rarity];
                    return (
                      <Tooltip key={achievement.id}>
                        <TooltipTrigger>
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${rarityConfig.bgColor} ring-1 ring-inset ring-black/5 dark:ring-white/10`}>
                            <span className="text-lg">{achievement.emoji}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                                ✓ {tAch(`list.${achievement.id}.name`)}
                              </p>
                              <span className="text-[11px]">{rarityConfig.emoji}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {tAch(`list.${achievement.id}.description`)}
                            </p>
                            <p className={`text-[11px] font-medium ${rarityConfig.color}`}>
                              {rarityConfig.name}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}

                  {/* Разделитель */}
                  {displayedUnlocked.length > 0 && displayedLocked.length > 0 && (
                    <div className="flex items-center shrink-0">
                      <div className="w-px h-5 bg-border" />
                    </div>
                  )}

                  {/* Невыполненные достижения */}
                  {displayedLocked.map((achievement) => {
                    const rarityConfig = RARITY_CONFIG[achievement.rarity];
                    const progressPercent = Math.min(100, (achievement.progress / achievement.requirement) * 100);
                    return (
                      <Tooltip key={achievement.id}>
                        <TooltipTrigger>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/30 ring-1 ring-inset ring-border/50 opacity-50 grayscale">
                            <span className="text-lg">{achievement.emoji}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold">
                                {tAch(`list.${achievement.id}.name`)}
                              </p>
                              <span className="text-[11px] opacity-50">{rarityConfig.emoji}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {tAch(`list.${achievement.id}.description`)}
                            </p>
                            <p className={`text-[11px] font-medium ${rarityConfig.color} opacity-70`}>
                              {rarityConfig.name}
                            </p>
                            <div className="space-y-0.5 pt-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-muted-foreground">{tAch("progress")}</span>
                                <span className="text-muted-foreground">
                                  {achievement.progress.toLocaleString()} / {achievement.requirement.toLocaleString()}
                                </span>
                              </div>
                              <Progress value={progressPercent} className="h-1 rounded-full" aria-label={`Achievement progress: ${progressPercent.toFixed(1)}%`} />
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>

                {/* Show more/less button */}
                {hiddenCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs rounded-full h-7 px-3"
                    onClick={() => setShowAllAchievements(!showAllAchievements)}
                  >
                    {showAllAchievements
                      ? tAch("showLess")
                      : tAch("showMore", { count: hiddenCount })
                    }
                  </Button>
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
