/**
 * Active Challenges Widget for Dashboard
 * Shows user's active challenges with progress and leaderboard position
 */

"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Target, ExternalLink, Loader2 } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  type: "speed" | "streak" | "completion";
  targetValue: number;
  startDate: string;
  endDate: string;
}

interface LeaderboardEntry {
  rank: number;
  score: number;
}

interface UserChallenge {
  challenge: Challenge;
  currentProgress: number;
  leaderboard: LeaderboardEntry | null;
}

interface ActiveChallengesWidgetProps {
  userId?: string;
}

export function ActiveChallengesWidget({ userId }: ActiveChallengesWidgetProps) {
  const t = useTranslations();

  // Fetch user's active challenges
  const { data: challenges, isLoading } = useQuery({
    queryKey: ["active-challenges", userId],
    queryFn: async () => {
      const url = userId
        ? `/api/challenges?userId=${userId}&status=active`
        : `/api/challenges?status=active`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch challenges");
      const json = await res.json();
      return json.data as UserChallenge[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const userChallenges = challenges?.filter(c => c.leaderboard !== null) || [];

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case "speed":
        return <TrendingUp className="h-4 w-4" />;
      case "streak":
        return <Trophy className="h-4 w-4" />;
      case "completion":
        return <Target className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    return t(`challenges.types.${type}`);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <Card className="px-3 py-2">
      <CardHeader className="pb-1.5 px-3 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">
              {t("dashboard.activeChallenges.title")}
            </CardTitle>
            <CardDescription className="text-xs">
              {t("dashboard.activeChallenges.description")}
            </CardDescription>
          </div>
          <Link href="/challenges">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : userChallenges.length === 0 ? (
          <div className="py-6 text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              {t("dashboard.activeChallenges.empty")}
            </p>
            <Link href="/challenges">
              <Button variant="outline" size="sm" className="mt-3">
                {t("dashboard.activeChallenges.browse")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {userChallenges.map((uc) => {
              const progressPercent = getProgressPercentage(
                uc.currentProgress,
                uc.challenge.targetValue
              );

              return (
                <Link
                  key={uc.challenge.id}
                  href={`/challenges/${uc.challenge.id}`}
                  className="block"
                >
                  <div className="rounded-lg border bg-card p-3 transition-colors hover:bg-accent">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                          {getChallengeIcon(uc.challenge.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-none">
                            {uc.challenge.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {getChallengeTypeLabel(uc.challenge.type)}
                          </p>
                        </div>
                      </div>
                      {uc.leaderboard && (
                        <Badge
                          variant={uc.leaderboard.rank <= 3 ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          #{uc.leaderboard.rank}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {t("dashboard.activeChallenges.progress")}
                        </span>
                        <span className="font-medium">
                          {uc.currentProgress} / {uc.challenge.targetValue}
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-1.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
