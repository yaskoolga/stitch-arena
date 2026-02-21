import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserChallengeParticipation } from "@/lib/challenges";

/**
 * GET /api/challenges/[id]
 * Returns challenge details with top 10 leaderboard and user's participation
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: challengeId } = await params;

    // Get challenge with participant count
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Get top 10 leaderboard
    const leaderboard = await prisma.challengeLeaderboard.findMany({
      where: { challengeId },
      include: {
        challenge: {
          select: {
            id: true,
            type: true,
            title: true,
          },
        },
      },
      orderBy: [{ rank: "asc" }, { score: "desc" }],
      take: 10,
    });

    // Enrich with user data
    const enrichedLeaderboard = await Promise.all(
      leaderboard.map(async (entry) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        });
        return { ...entry, user };
      })
    );

    // Get user's participation if logged in
    let userParticipation = null;
    let userLeaderboardEntry = null;

    if (session?.user?.id) {
      userParticipation = await getUserChallengeParticipation(
        session.user.id,
        challengeId
      );

      if (userParticipation) {
        userLeaderboardEntry = await prisma.challengeLeaderboard.findUnique({
          where: {
            challengeId_userId: {
              challengeId,
              userId: session.user.id,
            },
          },
        });
      }
    }

    return NextResponse.json({
      data: {
        challenge,
        leaderboard: enrichedLeaderboard,
        userParticipation,
        userLeaderboardEntry,
      },
    });
  } catch (error) {
    console.error("Error fetching challenge:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenge" },
      { status: 500 }
    );
  }
}
