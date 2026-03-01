"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementBadge } from "./achievement-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  requirement: number;
  rarity: string;
  isUnlocked: boolean;
  progress: number;
  unlockedAt: string | null;
}

interface AchievementsData {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

export function AchievementsSection() {
  const t = useTranslations('achievements');

  const { data, isLoading } = useQuery<AchievementsData>({
    queryKey: ["achievements"],
    queryFn: async () => {
      const res = await fetch("/api/achievements");
      if (!res.ok) throw new Error("Failed to fetch achievements");
      return res.json();
    },
  });

  if (isLoading || !data) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const categories = [
    { id: "all", label: t('categories.all') },
    { id: "projects", label: t('categories.projects') },
    { id: "stitches", label: t('categories.stitches') },
    { id: "streaks", label: t('categories.streaks') },
    { id: "logs", label: t('categories.logs') },
    { id: "speed", label: t('categories.speed') },
    { id: "social", label: t('categories.social') },
  ];

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('title')}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {data.unlockedCount} / {data.totalCount} {t('unlocked')}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {data.achievements
                  .filter(a => cat.id === "all" || a.category === cat.id)
                  .map(achievement => (
                    <AchievementBadge
                      key={achievement.id}
                      name={t(`list.${achievement.id}.name`)}
                      description={t(`list.${achievement.id}.description`)}
                      emoji={achievement.emoji}
                      isUnlocked={achievement.isUnlocked}
                      rarity={achievement.rarity as any}
                      progress={achievement.progress}
                      requirement={achievement.requirement}
                      size="md"
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
