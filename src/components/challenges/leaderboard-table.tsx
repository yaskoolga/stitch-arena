"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { Trophy, Medal } from "lucide-react";
import Image from "next/image";

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

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  challengeType: string;
}

export function LeaderboardTable({
  entries,
  currentUserId,
  challengeType,
}: LeaderboardTableProps) {
  const t = useTranslations();

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <Badge className="bg-yellow-500 text-white">
          <Trophy className="mr-1 h-3 w-3" />
          #1
        </Badge>
      );
    }
    if (rank === 2) {
      return (
        <Badge className="bg-gray-400 text-white">
          <Medal className="mr-1 h-3 w-3" />
          #2
        </Badge>
      );
    }
    if (rank === 3) {
      return (
        <Badge className="bg-orange-600 text-white">
          <Medal className="mr-1 h-3 w-3" />
          #3
        </Badge>
      );
    }
    return <Badge variant="outline">#{rank}</Badge>;
  };

  const getScoreLabel = () => {
    switch (challengeType) {
      case "speed":
        return t("stats.stitches");
      case "streak":
        return t("stats.days");
      case "completion":
        return t("common.projects");
      default:
        return t("challenges.leaderboard.score");
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("challenges.leaderboard.noEntries")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="space-y-2 min-w-[500px]">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
          <div className="col-span-2">{t("challenges.leaderboard.rank")}</div>
          <div className="col-span-7">{t("challenges.leaderboard.user")}</div>
          <div className="col-span-3 text-right">{getScoreLabel()}</div>
        </div>

        {/* Entries */}
        {entries.map((entry) => {
          const isCurrentUser = entry.user?.id === currentUserId;

          return (
            <div
              key={entry.id}
              className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg transition-colors ${
                isCurrentUser
                  ? "bg-primary/10 border border-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              {/* Rank */}
              <div className="col-span-2 flex items-center">
                {getRankBadge(entry.rank)}
              </div>

              {/* User */}
              <div className="col-span-7 flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  {entry.user?.avatar ? (
                    <Image
                      src={entry.user.avatar}
                      alt={entry.user.name || "User"}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-muted flex items-center justify-center w-full h-full text-sm">
                      {entry.user?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </Avatar>
                <span className="font-medium truncate">
                  {entry.user?.name || t("common.anonymous")}
                  {isCurrentUser && (
                    <Badge variant="outline" className="ml-2">
                      {t("common.you")}
                    </Badge>
                  )}
                </span>
              </div>

              {/* Score */}
              <div className="col-span-3 flex items-center justify-end">
                <span className="text-lg font-bold">
                  {entry.score.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
