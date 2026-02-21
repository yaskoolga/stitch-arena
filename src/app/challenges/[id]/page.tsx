"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LeaderboardTable } from "@/components/challenges/leaderboard-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Trophy,
  Users,
  Calendar,
  Target,
  TrendingUp,
  Medal,
} from "lucide-react";

interface Challenge {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  targetValue: number;
  _count: {
    participants: number;
  };
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  score: number;
  user: {
    id: string;
    name?: string | null;
    avatar?: string | null;
  } | null;
}

interface UserParticipation {
  id: string;
  currentProgress: number;
  joinedAt: string;
}

interface ChallengeData {
  challenge: Challenge;
  leaderboard: LeaderboardEntry[];
  userParticipation: UserParticipation | null;
  userLeaderboardEntry: {
    rank: number;
    score: number;
  } | null;
}

export default function ChallengeDetailPage() {
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  // Fetch challenge data
  const { data, isLoading } = useQuery<ChallengeData>({
    queryKey: ["challenge", id],
    queryFn: async () => {
      const response = await fetch(`/api/challenges/${id}`);
      const json = await response.json();
      return json.data;
    },
  });

  // Fetch full leaderboard if needed
  const { data: fullLeaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ["challenge-leaderboard", id],
    queryFn: async () => {
      const response = await fetch(`/api/challenges/${id}/leaderboard?limit=100`);
      const json = await response.json();
      return json.data || [];
    },
    enabled: showFullLeaderboard,
  });

  // Join/Leave mutations
  const joinMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/challenges/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join" }),
      });
      if (!response.ok) throw new Error("Failed to join");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge", id] });
      toast.success(t("challenges.joinSuccess"));
    },
    onError: () => {
      toast.error(t("toast.error.generic"));
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/challenges/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "leave" }),
      });
      if (!response.ok) throw new Error("Failed to leave");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge", id] });
      setLeaveDialogOpen(false);
      toast.success(t("challenges.leaveSuccess"));
    },
    onError: () => {
      toast.error(t("toast.error.generic"));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">
          {t("challenges.notFound")}
        </h3>
        <Button onClick={() => router.push("/challenges")}>
          {t("common.back")}
        </Button>
      </div>
    );
  }

  const { challenge, leaderboard, userParticipation, userLeaderboardEntry } = data;

  const now = new Date();
  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);

  const isActive = now >= startDate && now <= endDate;
  const isUpcoming = isFuture(startDate);
  const isPastChallenge = isPast(endDate);

  const daysRemaining = isActive ? differenceInDays(endDate, now) : 0;
  const progressPercent = userParticipation
    ? Math.min((userParticipation.currentProgress / challenge.targetValue) * 100, 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{challenge.title}</h1>
        </div>
        {challenge.description && (
          <p className="text-muted-foreground">{challenge.description}</p>
        )}

        {/* Status Badges */}
        <div className="flex gap-2 mt-4">
          {isPastChallenge && <Badge variant="secondary">{t("challenges.filters.past")}</Badge>}
          {isUpcoming && <Badge variant="outline">{t("challenges.filters.upcoming")}</Badge>}
          {isActive && <Badge variant="default">{t("challenges.filters.active")}</Badge>}
          <Badge>{t(`challenges.types.${challenge.type}`)}</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("challenges.participants")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {challenge._count.participants}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isActive ? t("challenges.daysRemaining") : t("challenges.duration")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isActive ? `${daysRemaining} days` : `${differenceInDays(endDate, startDate)} days`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("challenges.target")}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {challenge.targetValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Progress Card */}
      {session && userParticipation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("challenges.yourProgress")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("common.progress")}</span>
                <span className="font-medium">
                  {userParticipation.currentProgress.toLocaleString()} / {challenge.targetValue.toLocaleString()}
                </span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{progressPercent.toFixed(1)}% {t("common.complete")}</span>
                {userLeaderboardEntry && (
                  <span className="flex items-center gap-1">
                    <Medal className="h-3 w-3" />
                    {t("challenges.leaderboard.rank")} #{userLeaderboardEntry.rank}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Join/Leave Button */}
      {session && !isPastChallenge && (
        <Card>
          <CardContent className="pt-6">
            {userParticipation ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLeaveDialogOpen(true)}
                disabled={leaveMutation.isPending}
              >
                {t("challenges.leave")}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
              >
                <Trophy className="mr-2 h-4 w-4" />
                {t("challenges.join")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {t("challenges.leaderboard.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardTable
            entries={showFullLeaderboard ? (fullLeaderboard || []) : leaderboard}
            currentUserId={session?.user?.id}
            challengeType={challenge.type}
          />

          {!showFullLeaderboard && leaderboard.length >= 10 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => setShowFullLeaderboard(true)}
              >
                {t("common.viewMore")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Confirmation Dialog */}
      <ConfirmDialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        onConfirm={() => leaveMutation.mutate()}
        title={t("challenges.leaveConfirm.title")}
        description={t("challenges.leaveConfirm.description")}
      />
    </div>
  );
}
