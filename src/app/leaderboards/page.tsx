"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Target, Flame, Award } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  score: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
}

interface UserRankData {
  rank: number | null;
  score: number | null;
}

export default function LeaderboardsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("alltime");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRankData>({ rank: null, score: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  const fetchLeaderboard = async (type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboards?type=${type}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        console.error("Failed to fetch leaderboard:", data.error);
        setLeaderboard([]);
        setUserRank({ rank: null, score: null });
        return;
      }

      console.log(`Leaderboard ${type}:`, data.leaderboard?.length || 0, "entries");
      setLeaderboard(data.leaderboard || []);
      setUserRank(data.userRank || { rank: null, score: null });
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      setLeaderboard([]);
      setUserRank({ rank: null, score: null });
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return <Trophy className="h-5 w-5 text-yellow-500 fill-yellow-500" />;
    if (rank === 2)
      return <Trophy className="h-5 w-5 text-gray-400 fill-gray-400" />;
    if (rank === 3)
      return <Trophy className="h-5 w-5 text-orange-600 fill-orange-600" />;
    return null;
  };

  const getScoreLabel = (type: string) => {
    switch (type) {
      case "alltime":
      case "monthly":
      case "weekly":
        return "stitches";
      case "projects":
        return "projects";
      case "streak":
        return "days";
      default:
        return "points";
    }
  };

  const leaderboardTypes = [
    { key: "alltime", label: "All Time", icon: Trophy },
    { key: "monthly", label: "This Month", icon: TrendingUp },
    { key: "weekly", label: "This Week", icon: Award },
    { key: "projects", label: "Projects", icon: Target },
    { key: "streak", label: "Streaks", icon: Flame },
  ];

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Leaderboards</h1>
        <p className="text-muted-foreground">
          See how you stack up against other stitchers
        </p>
      </div>

      {/* User Rank Card */}
      {userRank.rank && (
        <Card className="p-6 rounded-2xl bg-primary/5 border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  #{userRank.rank}
                </div>
                <div className="text-xs text-muted-foreground">Your Rank</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {userRank.score?.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getScoreLabel(activeTab)}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full">
              {activeTab === "alltime" && "All Time"}
              {activeTab === "monthly" && "This Month"}
              {activeTab === "weekly" && "This Week"}
              {activeTab === "projects" && "Projects"}
              {activeTab === "streak" && "Current Streak"}
            </Badge>
          </div>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 rounded-full">
          {leaderboardTypes.map((type) => {
            const Icon = type.icon;
            return (
              <TabsTrigger
                key={type.key}
                value={type.key}
                className="rounded-full flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{type.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {leaderboardTypes.map((type) => (
          <TabsContent key={type.key} value={type.key} className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No data yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.user.id === session?.user?.id;

                  return (
                    <Card
                      key={entry.user.id}
                      className={`p-4 rounded-2xl transition-all hover:scale-[1.02] ${
                        isCurrentUser
                          ? "bg-primary/5 border-primary/20 ring-2 ring-primary/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-12 text-center">
                          {getRankBadge(entry.rank) || (
                            <span className="text-lg font-bold text-muted-foreground">
                              {entry.rank}
                            </span>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={entry.user.avatar || undefined} />
                            <AvatarFallback>
                              {entry.user.name?.[0] ||
                                entry.user.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">
                              {entry.user.name || "Anonymous"}
                              {isCurrentUser && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 rounded-full text-xs"
                                >
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {entry.user.email}
                            </div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            {entry.score.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getScoreLabel(activeTab)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
