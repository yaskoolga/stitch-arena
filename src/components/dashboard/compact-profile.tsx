"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { format } from "date-fns";
import { User, Calendar } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/constants";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
}

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

interface CompactProfileProps {
  userId?: string;  // If not specified - current user
  isOwn?: boolean;  // Is this the current user's profile?
}

export function CompactProfile({ userId, isOwn = true }: CompactProfileProps) {
  const t = useTranslations();
  const tAch = useTranslations("achievements");

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

  const unlocked = achievements?.filter((a) => a.unlockedAt) || [];
  const locked = achievements?.filter((a) => !a.unlockedAt) || [];
  const total = Object.values(ACHIEVEMENTS).length;

  if (!user) return null;

  return (
    <Card>
      <CardContent className="px-3 py-3">
        <div className="flex items-center gap-4">
          {/* Профиль слева */}
          <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
            <Avatar className="h-12 w-12 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-sm bg-gradient-to-br from-primary/20 to-primary/10">
                {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                {user.name || "Anonymous"}
              </p>
              {isOwn && (
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              )}
              <div className="flex items-center gap-1 mt-0.5">
                <Calendar className="h-2.5 w-2.5 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">
                  {t("common.memberSince")} {format(new Date(user.createdAt), "MMM yyyy")}
                </span>
              </div>
            </div>
            <User className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
          </Link>

          {/* Вертикальный разделитель */}
          <div className="h-12 w-px bg-border shrink-0" />

          {/* Достижения справа */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium">{tAch("title")}</span>
              <span className="text-[10px] text-muted-foreground">
                {unlocked.length}/{total}
              </span>
            </div>
            <TooltipProvider>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {/* Выполненные достижения */}
                {unlocked.map((achievement) => (
                  <Tooltip key={achievement.id}>
                    <TooltipTrigger>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                        <span className="text-lg">{achievement.emoji}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                          ✓ {tAch(`list.${achievement.id}.name`)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {tAch(`list.${achievement.id}.description`)}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}

                {/* Разделитель */}
                {unlocked.length > 0 && locked.length > 0 && (
                  <div className="flex items-center shrink-0">
                    <div className="w-px h-5 bg-border" />
                  </div>
                )}

                {/* Невыполненные достижения */}
                {locked.map((achievement) => (
                  <Tooltip key={achievement.id}>
                    <TooltipTrigger>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center opacity-30 grayscale">
                        <span className="text-lg">{achievement.emoji}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold">
                          {tAch(`list.${achievement.id}.name`)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {tAch(`list.${achievement.id}.description`)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {tAch("progress")}: {achievement.progress.toLocaleString()} /{" "}
                          {achievement.requirement.toLocaleString()}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
