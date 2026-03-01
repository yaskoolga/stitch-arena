import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaderboard, getUserRank, LeaderboardType } from "@/lib/leaderboards/calculator";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") || "alltime") as LeaderboardType;
  let period = searchParams.get("period") || undefined;

  // Auto-calculate period for monthly and weekly if not provided
  if (!period) {
    const now = new Date();
    if (type === "monthly") {
      period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    } else if (type === "weekly") {
      // Calculate ISO week
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
      period = `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
    }
  }

  try {
    // Get leaderboard
    const leaderboard = await getLeaderboard(type, period, 100);

    // Get user's rank if logged in
    let userRank = null;
    if (session?.user?.id) {
      const rank = await getUserRank(session.user.id, type, period);
      if (rank) {
        const userEntry = leaderboard.find(
          (entry) => entry.user.id === session.user.id
        );
        userRank = {
          rank,
          score: userEntry?.score || 0,
        };
      }
    }

    return NextResponse.json({
      leaderboard,
      userRank,
      type,
      period,
    });
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
